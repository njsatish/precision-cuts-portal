#!/usr/bin/env bash
set -euo pipefail

EXPECTED_REPO="headlines-portal"
EXPECTED_BRANCH="develop"
AWS_PROFILE="${AWS_PROFILE:-denduluru}"
AWS_REGION="${AWS_REGION:-us-east-1}"
EXPECTED_ACCOUNT_ID="${EXPECTED_ACCOUNT_ID:-989174615155}"
STACK_NAME="${STACK_NAME:-headlines-static-site}"
DOMAIN_NAME="${DOMAIN_NAME:-headlines.denduluru.com}"
HOSTED_ZONE_ID="${HOSTED_ZONE_ID:-Z21S238SFANDPM}"
TEMPLATE_FILE="infrastructure/headlines-static-site.yaml"
REPO_DEPLOY_SCRIPT="deployment/deploy_headlines_cloudfront_v1.sh"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-Add Headlines CloudFront website infrastructure}"

log(){ printf '\n=== %s ===\n' "$1"; }
fail(){ echo "ERROR: $*" >&2; exit 1; }

for cmd in aws git curl python3; do command -v "$cmd" >/dev/null 2>&1 || fail "Missing command: $cmd"; done

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Run this script inside $EXPECTED_REPO."
ROOT="$(git rev-parse --show-toplevel)"
[ "$(basename "$ROOT")" = "$EXPECTED_REPO" ] || fail "Wrong repository."
[ "$(git branch --show-current)" = "$EXPECTED_BRANCH" ] || fail "Expected branch $EXPECTED_BRANCH."
[ -f "$ROOT/public-site/index.html" ] || fail "public-site/index.html not found."
cd "$ROOT"

ACCOUNT_ID="$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)"
[ "$ACCOUNT_ID" = "$EXPECTED_ACCOUNT_ID" ] || fail "Expected AWS account $EXPECTED_ACCOUNT_ID, found $ACCOUNT_ID."

ZONE_NAME="$(aws route53 get-hosted-zone --profile "$AWS_PROFILE" --id "$HOSTED_ZONE_ID" --query HostedZone.Name --output text)"
[ "$ZONE_NAME" = "denduluru.com." ] || fail "Hosted zone $HOSTED_ZONE_ID is $ZONE_NAME, not denduluru.com."

echo "Account: $ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo "Domain: $DOMAIN_NAME"
echo "Hosted zone: $HOSTED_ZONE_ID"

mkdir -p infrastructure deployment
cat > "$TEMPLATE_FILE" <<'YAML'
AWSTemplateFormatVersion: '2010-09-09'
Description: Headlines static website using private S3, CloudFront OAC, ACM, and Route 53

Parameters:
  DomainName:
    Type: String
    Default: headlines.denduluru.com
  HostedZoneId:
    Type: String
  BucketName:
    Type: String

Resources:
  SiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        IgnorePublicAcls: true
        BlockPublicPolicy: true
        RestrictPublicBuckets: true
      OwnershipControls:
        Rules:
          - ObjectOwnership: BucketOwnerEnforced
      VersioningConfiguration:
        Status: Enabled

  Certificate:
    Type: AWS::CertificateManager::Certificate
    Properties:
      DomainName: !Ref DomainName
      ValidationMethod: DNS
      DomainValidationOptions:
        - DomainName: !Ref DomainName
          HostedZoneId: !Ref HostedZoneId

  OriginAccessControl:
    Type: AWS::CloudFront::OriginAccessControl
    Properties:
      OriginAccessControlConfig:
        Name: !Sub '${AWS::StackName}-oac'
        Description: OAC for Headlines private S3 origin
        OriginAccessControlOriginType: s3
        SigningBehavior: always
        SigningProtocol: sigv4

  CachePolicy:
    Type: AWS::CloudFront::CachePolicy
    Properties:
      CachePolicyConfig:
        Name: !Sub '${AWS::StackName}-cache'
        DefaultTTL: 300
        MaxTTL: 3600
        MinTTL: 0
        ParametersInCacheKeyAndForwardedToOrigin:
          CookiesConfig:
            CookieBehavior: none
          EnableAcceptEncodingBrotli: true
          EnableAcceptEncodingGzip: true
          HeadersConfig:
            HeaderBehavior: none
          QueryStringsConfig:
            QueryStringBehavior: none

  Distribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Aliases:
          - !Ref DomainName
        Comment: Headlines barbershop website
        DefaultRootObject: index.html
        Enabled: true
        HttpVersion: http2and3
        IPV6Enabled: true
        PriceClass: PriceClass_100
        Origins:
          - Id: SiteS3Origin
            DomainName: !GetAtt SiteBucket.RegionalDomainName
            OriginAccessControlId: !GetAtt OriginAccessControl.Id
            S3OriginConfig:
              OriginAccessIdentity: ''
        DefaultCacheBehavior:
          TargetOriginId: SiteS3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods: [GET, HEAD, OPTIONS]
          CachedMethods: [GET, HEAD, OPTIONS]
          Compress: true
          CachePolicyId: !Ref CachePolicy
        CustomErrorResponses:
          - ErrorCode: 403
            ResponseCode: 404
            ResponsePagePath: /404.html
            ErrorCachingMinTTL: 60
          - ErrorCode: 404
            ResponseCode: 404
            ResponsePagePath: /404.html
            ErrorCachingMinTTL: 60
        ViewerCertificate:
          AcmCertificateArn: !Ref Certificate
          SslSupportMethod: sni-only
          MinimumProtocolVersion: TLSv1.2_2021

  SiteBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref SiteBucket
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Sid: AllowCloudFrontReadOnly
            Effect: Allow
            Principal:
              Service: cloudfront.amazonaws.com
            Action: s3:GetObject
            Resource: !Sub '${SiteBucket.Arn}/*'
            Condition:
              StringEquals:
                AWS:SourceArn: !Sub 'arn:${AWS::Partition}:cloudfront::${AWS::AccountId}:distribution/${Distribution}'

  DnsRecordIPv4:
    Type: AWS::Route53::RecordSet
    Properties:
      HostedZoneId: !Ref HostedZoneId
      Name: !Ref DomainName
      Type: A
      AliasTarget:
        DNSName: !GetAtt Distribution.DomainName
        HostedZoneId: Z2FDTNDATAQYW2
        EvaluateTargetHealth: false

  DnsRecordIPv6:
    Type: AWS::Route53::RecordSet
    Properties:
      HostedZoneId: !Ref HostedZoneId
      Name: !Ref DomainName
      Type: AAAA
      AliasTarget:
        DNSName: !GetAtt Distribution.DomainName
        HostedZoneId: Z2FDTNDATAQYW2
        EvaluateTargetHealth: false

Outputs:
  WebsiteURL:
    Value: !Sub 'https://${DomainName}'
  BucketName:
    Value: !Ref SiteBucket
  DistributionId:
    Value: !Ref Distribution
  DistributionDomainName:
    Value: !GetAtt Distribution.DomainName
  CertificateArn:
    Value: !Ref Certificate
YAML

# Preserve this exact deploy workflow in the repository.
SCRIPT_SOURCE="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
if [ "$SCRIPT_SOURCE" != "$ROOT/$REPO_DEPLOY_SCRIPT" ]; then
  cp "$SCRIPT_SOURCE" "$REPO_DEPLOY_SCRIPT"
  chmod +x "$REPO_DEPLOY_SCRIPT"
fi

BUCKET_NAME="headlines-denduluru-com-$ACCOUNT_ID"

log "Validate CloudFormation template"
aws cloudformation validate-template \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --template-body "file://$TEMPLATE_FILE" >/dev/null

log "Deploy S3, ACM, CloudFront, and Route 53"
echo "This can take 10 to 30 minutes while ACM and CloudFront finish provisioning."
aws cloudformation deploy \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE_FILE" \
  --parameter-overrides \
    "DomainName=$DOMAIN_NAME" \
    "HostedZoneId=$HOSTED_ZONE_ID" \
    "BucketName=$BUCKET_NAME" \
  --no-fail-on-empty-changeset \
  --tags Project=headlines-portal Environment=development

STACK_STATUS="$(aws cloudformation describe-stacks --profile "$AWS_PROFILE" --region "$AWS_REGION" --stack-name "$STACK_NAME" --query 'Stacks[0].StackStatus' --output text)"
case "$STACK_STATUS" in
  CREATE_COMPLETE|UPDATE_COMPLETE) ;;
  *) fail "CloudFormation stack ended in status $STACK_STATUS" ;;
esac

DISTRIBUTION_ID="$(aws cloudformation describe-stacks --profile "$AWS_PROFILE" --region "$AWS_REGION" --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue | [0]" --output text)"
DISTRIBUTION_DOMAIN="$(aws cloudformation describe-stacks --profile "$AWS_PROFILE" --region "$AWS_REGION" --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue | [0]" --output text)"

[ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ] || fail "Distribution ID missing from stack outputs."

log "Upload public-site to private S3 bucket"
aws s3 sync public-site/ "s3://$BUCKET_NAME/" \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --delete \
  --exclude '.DS_Store' \
  --cache-control 'public,max-age=300'

# HTML should revalidate quickly; assets can remain cached for five minutes until versioned filenames are introduced.
aws s3 cp public-site/ "s3://$BUCKET_NAME/" \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --recursive \
  --exclude '*' \
  --include '*.html' \
  --cache-control 'no-cache' \
  --content-type 'text/html'

log "Wait for CloudFront deployment"
aws cloudfront wait distribution-deployed \
  --profile "$AWS_PROFILE" \
  --id "$DISTRIBUTION_ID"

INVALIDATION_ID="$(aws cloudfront create-invalidation \
  --profile "$AWS_PROFILE" \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths '/*' \
  --query Invalidation.Id \
  --output text)"
aws cloudfront wait invalidation-completed \
  --profile "$AWS_PROFILE" \
  --distribution-id "$DISTRIBUTION_ID" \
  --id "$INVALIDATION_ID"

log "Validate DNS and HTTPS"
for attempt in $(seq 1 30); do
  if dig +short "$DOMAIN_NAME" | grep -q .; then break; fi
  echo "Waiting for DNS... attempt $attempt/30"
  sleep 10
done

dig +short "$DOMAIN_NAME" | grep -q . || fail "DNS still does not resolve for $DOMAIN_NAME."
HTTP_CODE="$(curl -sS -L --max-time 30 -o /tmp/headlines-homepage.html -w '%{http_code}' "https://$DOMAIN_NAME/")"
[ "$HTTP_CODE" = "200" ] || fail "Homepage returned HTTP $HTTP_CODE."
grep -qi 'Headlines' /tmp/headlines-homepage.html || fail "Homepage did not contain Headlines."

BOOK_CODE="$(curl -sS -L --max-time 30 -o /tmp/headlines-book.html -w '%{http_code}' "https://$DOMAIN_NAME/book.html?service=haircut")"
[ "$BOOK_CODE" = "200" ] || fail "Booking page returned HTTP $BOOK_CODE."

echo "Distribution ID: $DISTRIBUTION_ID"
echo "Distribution domain: $DISTRIBUTION_DOMAIN"
echo "Website: https://$DOMAIN_NAME"

log "Commit infrastructure only after deployment succeeds"
git add "$TEMPLATE_FILE" "$REPO_DEPLOY_SCRIPT"
git diff --cached --check
if ! git diff --cached --quiet; then
  git commit -m "$COMMIT_MESSAGE"
  git push -u origin "$EXPECTED_BRANCH"
else
  echo "No infrastructure file changes to commit."
fi

LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git ls-remote origin "refs/heads/$EXPECTED_BRANCH" | awk '{print $1}')"
[ "$LOCAL_HEAD" = "$REMOTE_HEAD" ] || fail "Local and origin/$EXPECTED_BRANCH do not match after push."

echo "SUCCESS: CloudFront website deployed and infrastructure pushed."

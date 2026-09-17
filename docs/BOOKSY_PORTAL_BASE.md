# Configurable Booksy Portal Base

The business-specific source of truth is `public-site/assets/config/portal.json`.

It controls business identity, contact details, Booksy IDs, service IDs, variant IDs, availability routes, brand assets, colors, page content, staff, reviews, gallery items, social links, and SEO.

## Generate and validate

```bash
python3 tools/validate_portal_config.py public-site/assets/config/portal.json
python3 tools/generate_portal_config.py public-site/assets/config/portal.json
node --check public-site/assets/js/config/generated-portal.js
node --check public-site/assets/js/config/portal-runtime.js
git diff --check
```

Do not manually edit `generated-portal.js`.

## Create another project

1. Copy and edit `public-site/assets/config/portal.example.json`.
2. Replace the sample business, Booksy, staff, service, review, gallery, brand, and content values.
3. Run:

```bash
tools/create_booksy_project.sh /absolute/path/business.json /absolute/path/new-project
```

## Booksy identifiers

- `businessId`: public Booksy business identifier
- `widgetId`: official widget and instant-experience identifier
- `stafferId`: Booksy staff member identifier
- `serviceId`: parent Booksy service identifier
- `variantId`: availability and instant-experience identifier

Instant-experience links use:

```text
{instantExperienceBase}/{widgetId}?variantId={variantId}&date={YYYY-MM-DDTHH:mm}
```

## Runtime hooks

```html
<span data-portal-text="business.name"></span>
<a data-portal-href="bookingProvider.profileUrl">Book on Booksy</a>
<img data-portal-src="brand.logo" alt="Business logo">
```

## Required per-project deployment inputs

- AWS account/profile and region
- domain and hosted-zone ID
- CloudFormation stack name
- Booksy availability API base

Do not copy one customer's AWS account, domain, Booksy IDs, or service mapping into another project.

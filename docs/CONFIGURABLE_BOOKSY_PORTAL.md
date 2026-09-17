# Configurable Booksy Business Portal

The portal is moving toward a configuration-driven architecture. A new business should require data and assets rather than repeated HTML edits.

## Primary configuration

Edit:

```text
public-site/assets/config/portal.json
```

A blank starting point is available at:

```text
public-site/assets/config/portal.example.json
```

## Inputs required for a new portal

1. Business name, logo, domain, phone, email, address, social links, hours, and Booksy URL.
2. Owner or staff name, photo, bio, Booksy staffer ID, and default service.
3. Approved reviews.
4. Work photos.
5. For each Booksy service: slug, name, description, duration, price, service ID, service variant ID, and availability route.
6. API Gateway availability base URL.
7. Theme colors, fonts, content width, and border radius.

## Booksy identifier distinction

The Lambda availability request uses `variantId`, not the parent `serviceId`.

## Theme customization

Edit the theme variables in `portal.json` or create a CSS preset under:

```text
public-site/assets/css/themes/
```

Important variables include background, surfaces, text colors, primary/secondary/accent colors, fonts, content width, and corner radius.

## Validation

```bash
python3 tools/validate_portal_config.py
```

## Install another business configuration

```bash
tools/bootstrap_new_business.sh path/to/new-business-portal.json
```

## Migration status

This commit adds the configuration foundation without changing current page behavior. Existing pages can be migrated incrementally to `data-config-*` bindings and generated service, staff, review, gallery, and hours components after current Headlines content work is complete.

This staged approach avoids destabilizing the working booking and deployment flows.

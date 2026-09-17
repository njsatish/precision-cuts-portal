# Headlines Booksy Service Mapping

This file documents the canonical service mapping used by the website and availability Lambdas.

| Website slug | Service | Service ID | Variant ID required by Lambda | Duration | Price |
| --- | --- | ---: | ---: | ---: | ---: |
| `haircut` | Haircut | `634731` | `9396822` | 45 min | $50 |
| `haircut-and-beard` | Haircut & Beard | `574263` | `9396820` | 45 min | $60 |
| `kids-cut` | Kid's cut, 16 and under | `3602928` | `9396824` | 35 min | $35 |
| `black-mask` | Black mask with charcoal and eucalyptus oil | `623287` | `9396821` | 20 min | $25 |

## Identifier usage

- `serviceId` is the parent Booksy service identifier.
- `variantId` is the identifier required by the availability Lambda request.
- `slug` is the website and API route key.
- `availabilityPath` is `/availability/<slug>`.

## Browser configuration

The browser-readable generated file is:

```text
public-site/assets/js/config/headlines-services.js
```

Do not edit that generated file directly. Update `portal.json` and regenerate it.

## Important booking handoff limitation

The general Booksy profile URL does not guarantee that the selected service, date, and time will be preselected. An official Booksy website widget or documented Booksy handoff is required for that behavior.

const BARBERS = {
  "keith-lemon": {
    "businessId": 97909,
    "stafferId": 117783,
    "services": {
      "haircut-no-beard-trim-19-up": {
        "variantId": 5519794,
        "serviceId": 602728,
        "name": "Haircut // NO BEARD TRIM! 19 & up!"
      },
      "kid-haircut-6-to-15": {
        "variantId": 2060907,
        "serviceId": 602733,
        "name": "Kid haircut 6yrs to 15yrs old"
      },
      "haircut-plus-beard": {
        "variantId": 6589869,
        "serviceId": 3365178,
        "name": "Haircut plus Beard!"
      },
      "teenagers-15-to-18": {
        "variantId": 15473908,
        "serviceId": 6836423,
        "name": "Teenagers 15 to 18"
      },
      "eyebrows-clippers-or-razor-cut": {
        "variantId": 3665636,
        "serviceId": 1981416,
        "name": "Eyebrows // Clippers or razor cut"
      }
    }
  },
  "christopher-meadows": {
    "businessId": 1648732,
    "stafferId": 1568123,
    "services": {
      "christopher-haircut": {
        "variantId": 19563486,
        "serviceId": 10705836,
        "name": "Haircut"
      },
      "christopher-mens-haircut": {
        "variantId": 19563493,
        "serviceId": 10705843,
        "name": "Men's Haircut"
      },
      "christopher-haircut-beard": {
        "variantId": 19563488,
        "serviceId": 10705838,
        "name": "Haircut & Beard"
      },
      "christopher-kids-haircut": {
        "variantId": 19563489,
        "serviceId": 10705839,
        "name": "Kid's Haircut"
      },
      "christopher-skin-fade": {
        "variantId": 19563496,
        "serviceId": 10705846,
        "name": "Skin Fade"
      },
      "christopher-buzz-cut": {
        "variantId": 19563498,
        "serviceId": 10705848,
        "name": "Buzz Cut"
      },
      "christopher-beard-trim": {
        "variantId": 19563497,
        "serviceId": 10705847,
        "name": "Beard Trim"
      },
      "christopher-beard-shaping": {
        "variantId": 19563490,
        "serviceId": 10705840,
        "name": "Beard Shaping"
      },
      "christopher-line-up": {
        "variantId": 19563491,
        "serviceId": 10705841,
        "name": "Line Up"
      },
      "christopher-edge-up": {
        "variantId": 19563495,
        "serviceId": 10705845,
        "name": "Edge Up"
      },
      "christopher-head-shave": {
        "variantId": 19563492,
        "serviceId": 10705842,
        "name": "Head Shave"
      },
      "christopher-head-shave-beard-trim": {
        "variantId": 19563500,
        "serviceId": 10705850,
        "name": "Head Shave & Beard Trim"
      },
      "christopher-hot-towel-shave": {
        "variantId": 19563502,
        "serviceId": 10705852,
        "name": "Hot Towel Shave"
      },
      "christopher-straight-razor-shave": {
        "variantId": 19563503,
        "serviceId": 10705853,
        "name": "Straight Razor Shave"
      },
      "christopher-eyebrow-shaping": {
        "variantId": 19563494,
        "serviceId": 10705844,
        "name": "Eyebrow Shaping"
      },
      "christopher-hair-wash": {
        "variantId": 19563506,
        "serviceId": 10705856,
        "name": "Hair Wash"
      },
      "christopher-facial": {
        "variantId": 19563509,
        "serviceId": 10705859,
        "name": "Facial"
      },
      "christopher-full-service": {
        "variantId": 19563501,
        "serviceId": 10705851,
        "name": "Full Service"
      }
    }
  },
  "ron-the-barber": {
    "businessId": 1700058,
    "stafferId": 1622181,
    "services": {
      "ron-haircut": {
        "variantId": 20194286,
        "serviceId": 11308609,
        "name": "Haircut"
      },
      "ron-haircut-beard": {
        "variantId": 20506298,
        "serviceId": 11595370,
        "name": "Haircut & Beard"
      },
      "ron-kids-haircut-7-up": {
        "variantId": 20194287,
        "serviceId": 11308612,
        "name": "Kid's Haircut, Age 7+"
      },
      "ron-head-shave": {
        "variantId": 21102277,
        "serviceId": 12128174,
        "name": "Head Shave"
      },
      "ron-edge-up": {
        "variantId": 20194244,
        "serviceId": 11308613,
        "name": "Edge Up Only"
      },
      "ron-beard-only": {
        "variantId": 20194250,
        "serviceId": 11308610,
        "name": "Beard Only"
      }
    }
  }
,
  "levar-neal": {
    "businessId": 1814949,
    "stafferId": 1741554,
    "services": {
      "mens-hair-cut": { "variantId": 21524117, "name": "Mens Hair Cut" },
      "kids-haircut-6-12": { "variantId": 21524984, "name": "Kid’s Haircut 6-12" },
      "head-shave": { "variantId": 21525019, "name": "Head shave" },
      "beard-trim": { "variantId": 21525074, "name": "Beard trim" },
      "hot-towel-shave": { "variantId": 21525078, "name": "Hot towel shave" },
      "head-shave-beard-trim": { "variantId": 21525090, "name": "Head shave and beard trim" },
      "haircut-hot-towel-shave": { "variantId": 21525107, "name": "Men’s haircut and hot towel shave" },
      "shampoo": { "variantId": 21525127, "name": "Shampoo" },
      "haircut-beard-trim": { "variantId": 21526440, "name": "Men’s haircut and beard trim" }
    }
  }
};
const LEGACY_BARBER = "keith-lemon";

const cors = origin => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Cache-Control": "no-store"
});
const reply=(status,body,origin)=>({statusCode:status,headers:cors(origin),body:JSON.stringify(body)});
const dateOnly=d=>d.toISOString().slice(0,10);

function normalizeSlots(payload) {
  const out=[];
  const roots = payload?.time_slots || payload?.availability || payload?.days || [];
  for (const day of roots) {
    const date=day.date || day.day || day.start_date;
    const entries=day.slots || day.time_slots || day.times || [];
    for (const slot of entries) {
      const time=typeof slot === "string" ? slot : (slot.t || slot.time || slot.start_time || slot.start);
      if(date && time) out.push({date:String(date).slice(0,10),time:String(time)});
    }
  }
  return out;
}

export const handler=async(event={})=>{
  const origin=event.headers?.origin || event.headers?.Origin || "";
  if(event.requestContext?.http?.method === "OPTIONS") return reply(204,{},origin);
  try {
    const rawPath=String(event.rawPath || event.path || "");
    const parts=rawPath.split("/").filter(Boolean);
    let barberSlug=event.pathParameters?.barberSlug;
    let serviceSlug=event.pathParameters?.serviceSlug;
    if(!barberSlug && parts[0] === "availability") {
      if(parts.length >= 3) { barberSlug=parts[1]; serviceSlug=parts[2]; }
      else if(parts.length === 2) { barberSlug=LEGACY_BARBER; serviceSlug=parts[1]; }
    }
    if(!barberSlug || !serviceSlug) return reply(400,{success:false,error:"Barber and service are required."},origin);
    const barber=BARBERS[barberSlug];
    const service=barber?.services?.[serviceSlug];
    if(!barber || !service) return reply(404,{success:false,error:"Unknown verified barber or service."},origin);

    const apiKey=process.env.BOOKSY_API_KEY;
    const appVersion=process.env.BOOKSY_APP_VERSION;
    const fingerprint=process.env.BOOKSY_FINGERPRINT;
    if(!apiKey || !appVersion || !fingerprint) throw new Error("Booksy credentials are not configured.");

    const start=new Date();
    const end=new Date(); end.setUTCDate(end.getUTCDate()+30);
    const url=`https://us.booksy.com/core/v2/customer_api/me/businesses/${barber.businessId}/appointments/time_slots`;
    const upstream=await fetch(url,{
      method:"POST",
      headers:{
        "Accept":"application/json",
        "Content-Type":"application/json",
        "Origin":"https://booksy.com",
        "Referer":"https://booksy.com/",
        "X-Api-Key":apiKey,
        "X-App-Version":appVersion,
        "X-Fingerprint":fingerprint
      },
      body:JSON.stringify({
        subbookings:[{service_variant_id:service.variantId,staffer_id:barber.stafferId,combo_children:[]}],
        start_date:dateOnly(start),
        end_date:dateOnly(end)
      })
    });
    const text=await upstream.text();
    let data={}; try { data=JSON.parse(text); } catch { data={raw:text.slice(0,500)}; }
    if(!upstream.ok) throw new Error(`Booksy HTTP ${upstream.status}: ${text.slice(0,240)}`);
    const slots=normalizeSlots(data);
    return reply(200,{
      success:true,
      barberSlug,
      serviceSlug,
      businessId:barber.businessId,
      stafferId:barber.stafferId,
      serviceName:service.name,
      slots,
      availability:slots
    },origin);
  } catch(error) {
    console.error(error);
    return reply(502,{success:false,error:"Availability could not be loaded."},origin);
  }
};

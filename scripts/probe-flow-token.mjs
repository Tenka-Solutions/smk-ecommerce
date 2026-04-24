import { createHmac } from "node:crypto";

const token = process.argv[2];
if (!token) {
  console.error("usage: node probe-flow-token.mjs <token>");
  process.exit(1);
}

const apiKey = process.env.FLOW_API_KEY;
const secret = process.env.FLOW_SECRET_KEY;
const apiUrl = process.env.FLOW_API_URL;

const params = { apiKey, token };
const sorted = Object.keys(params)
  .sort()
  .map((k) => `${k}=${params[k]}`)
  .join("&");
const sig = createHmac("sha256", secret).update(sorted).digest("hex");

const url = `${apiUrl}/payment/getStatus?${new URLSearchParams({
  ...params,
  s: sig,
}).toString()}`;

const res = await fetch(url);
const text = await res.text();
console.log("HTTP", res.status);
console.log(text);

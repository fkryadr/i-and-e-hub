import { createThirdwebClient } from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";

// Replace with your actual client ID from thirdweb dashboard
const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "0c8c779f95c12067e9afd7c1b94566a0";

export const client = createThirdwebClient({
  clientId: CLIENT_ID,
});

export const chain = polygonAmoy;

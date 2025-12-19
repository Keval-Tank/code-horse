import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo } from "@/inngest/functions";
import { rankArepo } from "@/inngest/functions/rank";
import { generateReview } from "@/inngest/functions/review";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    indexRepo, generateReview , rankArepo],
});
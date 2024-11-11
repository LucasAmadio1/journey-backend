import fastify from "fastify";
import cors from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { createActivity } from "./routes/activities/create-activity";
import { getActivities } from "./routes/activities/get-activities";
import { createLink } from "./routes/links/create-link";
import { getLinks } from "./routes/links/get-links";
import { updateTrip } from "./routes/trips/update-trip";
import { createInvite } from "./routes/participants/create-invite";
import { getParticipants } from "./routes/participants/get-participants";
import { createTrip } from "./routes/trips/create-trip";
import { confirmTrip } from "./routes/trips/confirm-trip";
import { confirmParticipant } from "./routes/trips/confirm-participant";
import { getTripDetails } from "./routes/trips/get-trip-details";
import { getParticipant } from "./routes/participants/get-participant";

const app = fastify();

app.register(cors, {
  origin: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivity);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);
app.register(getParticipants);
app.register(createInvite);
app.register(updateTrip);
app.register(getTripDetails);
app.register(getParticipant);

app.listen({ port: 3333 }).then(() => {
  console.log("Server running!");
});

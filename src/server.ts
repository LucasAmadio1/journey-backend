import fastify from "fastify";
import cors from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { confirmTrip } from "./routes/confirm-trip";
import { createTrip } from "./routes/create-trip";
import { confirmParticipant } from "./routes/confirm-participant";

const app = fastify();

app.register(cors, {
  origin: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);

app.listen({ port: 3333 }).then(() => {
  console.log("Server running!");
});

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, response) => {
      const { tripId } = request.params;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participants: {
            where: {
              is_owner: false,
            },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found.");
      }

      if (trip.is_confirmed) {
        return response.redirect(`http://localhost:3000/trips/${tripId}`);
      }

      await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          is_confirmed: true,
        },
      });

      const formatedStartDate = dayjs(trip.starts_at).format("LL");
      const formatedEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient();

      await Promise.all([
        trip.participants.map(async (participant) => {
          const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm/${participant.id}`;

          const message = await mail.sendMail({
            from: {
              name: "Equipe plann.er",
              address: "plan@plann.er",
            },
            to: participant.email,
            subject: `Confirme sua viagem para ${trip.destination} em ${formatedStartDate}`,
            html: `
              <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                <p>Você foi convidado(a) para participar de uma viagem para <Strong>${trip.destination}</Strong>, nas datas de <Strong>${formatedStartDate}</Strong> até <strong>${formatedEndDate}</strong>.</p>
                <p></p>
                <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
                <p></p>
                <p>
                  <a href="${confirmationLink}">Confirmar presença</a>
                </p>
                <p></p>
                <p>Caso esteja usando o dispositivo móvel, você também pode confirmar presença pelos aplicativos:</p>
                <p></p>
                  <a href="${confirmationLink}">Aplicativo para iPhone </a>
                  <p></p>
                  <a href="${confirmationLink}">Aplicativo para Android </a>
                <p></p>
                <p>Caso você não saiba do que se trata esse e-mail ou não poderá estar presente, apenas ignore esse e-mail.</p>
              </div>
    
            `.trim(),
          });

          console.log(nodemailer.getTestMessageUrl(message));
        }),
      ]);

      return response.redirect(`http://localhost:3000/trips/${tripId}`);
    },
  );
}

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "us-east-1" });

export async function sendInviteEmail(params: {
  to: string;
  workspaceName: string;
  inviterEmail: string;
  token: string;
}) {
  const inviteUrl = `${process.env.APP_URL}/invite?token=${params.token}`;

  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL!,
    Destination: {
      ToAddresses: [params.to],
    },
    Message: {
      Subject: {
        Data: `You've been invited to ${params.workspaceName}`,
      },
      Body: {
        Html: {
          Data: `
            <p>Hi,</p>
            <p>${params.inviterEmail} invited you to join <strong>${params.workspaceName}</strong>.</p>
            <p><a href="${inviteUrl}">Click here to accept the invite</a></p>
            <p>This link expires in 7 days.</p>
          `,
        },
      },
    },
  });

  await ses.send(command);
}

type SendOrganizationInvitationParams = {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
};

export async function sendOrganizationInvitation({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: SendOrganizationInvitationParams): Promise<void> {
  await sendEmail({
    from: 'John Doe <test@test.com>',
    to: email,
    subject: `${invitedByUsername} has invited you to ${teamName}`,
    html: `<h1>Welcome!</h1><p>Here is the invite link: ${inviteLink}</p>`
  })
  console.log("Sending organization invitation", {
    to: email,
    invitedByUsername,
    invitedByEmail,
    teamName,
    inviteLink,
  });
}
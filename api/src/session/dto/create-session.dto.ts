export class CreateSessionDto {
  identity: string;
  firstName?: string;
  lastName?: string;
  avatarColor?: string;
  countryCode?: string;
  language?: string;
  timezone?: string;
}
import { GetUserProfileDataDto, GetUserProfileResponseDto } from './types';

export function getUserProfile(
  user: GetUserProfileDataDto,
): GetUserProfileResponseDto {
  const { name, lastName, id, email, cellphone } = user;
  let response: GetUserProfileResponseDto = {
    name,
    lastName,
    email,
    id,
    cellphone,
  };

  return response;
}

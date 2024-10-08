import { GetUserProfileResponseDto } from 'src/helpers/mappings/user/types';

export type UserSigninResponseDto = {
  user: GetUserProfileResponseDto;
};

import * as functions from 'firebase-functions';
import { CreateNewUser, DisableAccount, UsernameFromEmail, ValidUTPLEmail } from '../utils/users-utils';


export const assignNewUserClaims = functions.auth.user().onCreate(async (user, _) => {

  const { uid, email, displayName, disabled, photoURL } = user;

  if (email && ValidUTPLEmail(email)) {
    const username = UsernameFromEmail(email);
    await CreateNewUser(username, { uid, email, displayName, disabled, photoURL });
  } else {
    await DisableAccount({ uid });
  }
});

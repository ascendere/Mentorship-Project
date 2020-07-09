import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';
import { sendEmail } from '../../utils/utils';
import { BASE_URL, DEFAULT_EMAIL_SEND } from '../../utils/variables';

async function sendEmailToUser(
  accompaniment: firestore.DocumentData & {
    student?: { email?: string; displayName?: string; id?: string };
    reviewKey?: string;
    id?: string;
    mentor?: { displayName?: string };
    period?: { reference?: { id?: string } };
  },
) {
  try {
    const msg = {
      to: accompaniment?.student?.email,
      from: DEFAULT_EMAIL_SEND,
      templateId: 'd-db5d5d6bfb6649c1afcb97151da70051',
      dynamic_template_data: {
        redirectUrl: `${BASE_URL}/panel-control/${accompaniment?.period?.reference?.id}/calificar-acompañamiento/${accompaniment?.student?.id}/${accompaniment.id}/${accompaniment.reviewKey}`,
        accompanimentId: accompaniment.id,
        studentName: accompaniment?.student?.displayName?.toUpperCase(),
        mentorName: accompaniment?.mentor?.displayName?.toUpperCase(),
      },
    };

    await sendEmail(msg);
  } catch (error) {
    console.error({
      message: "Message couldn't be send.",
      error,
      accompaniment,
    });
  }
}

async function sendNotificationToAdministrators(accompaniment: firestore.DocumentData) {
  // get administrators
  const snaps = await firestore().collection('claims').where('isAdmin', '==', true).get();
  const emails = snaps.docs.map(s => s.id);

  const tasks = emails.map(async email => {
    const username = email.split('@')[0];
    const id = firestore().collection('users').doc(username).collection('notifications').doc().id;
    return await firestore().collection('users').doc(username).collection('notifications').doc(id).set({
      id,
      displayName: accompaniment.mentor.displayName,
      message: 'Ha marcado un acompañamiento como importante.',
      unRead: true,
      redirect: `/panel-control/abr20-ago20/acompañamientos/ver/${accompaniment.mentor.reference.id}/${accompaniment.id}`,
      time: firestore.FieldValue.serverTimestamp()
    });
  })

  await Promise.all(tasks);
}

async function getAccompaniment(doc: functions.firestore.DocumentSnapshot) {
  return (doc.exists) ? doc.data() : null;
}

export const mailAccompanimentReview = functions.firestore
  .document('accompaniments/{accompanimentId}')
  .onCreate(async (document, _) => {
    const accompaniment = await getAccompaniment(document);

    if (!accompaniment)
      return;

    const tasks = [];

    tasks.push(sendEmailToUser(accompaniment));

    // accompaniment tagged as important 
    // send notification to administrators
    if (accompaniment.important)
      tasks.push(sendNotificationToAdministrators(accompaniment));

    await Promise.all(tasks);
  });

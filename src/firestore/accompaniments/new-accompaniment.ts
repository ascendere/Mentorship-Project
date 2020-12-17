import { SGMAccompaniment, SGMNotification } from '@utpl-rank/sgm-helpers';
import * as functions from 'firebase-functions';
import { GeneralEmail } from '../../shared/mail/general-email';
import { SaveEmail } from '../../shared/mail/save-email';
import { ValidateAccompanimentEmail } from '../../shared/mail/templates/validate-accompaniment-email/validate-accompanimet-email';
import { SendNotification } from '../../utils/notifiactions-utils';
import { UsernameFromEmail } from '../../utils/users-utils';
import { BASE_URL } from '../../utils/variables';


async function notifyUserOfAccompaniment({ id, student, mentor, period, reviewKey }: SGMAccompaniment.readDTO): Promise<void> {
  const studentUsername = UsernameFromEmail(student.email);

  const template = new ValidateAccompanimentEmail({
    redirectUrl: `${BASE_URL}/panel-control/${period.reference.id}/calificar-acompañamiento/${student.reference.id}/${id}/${reviewKey}`,
    accompanimentId: id,
    studentName: student.displayName.toUpperCase(),
    mentorName: mentor.displayName.toUpperCase(),
  });

  const generalEmail = new GeneralEmail(student.email, 'Validación del seguimiento realizado', template);
  const saver = new SaveEmail(studentUsername, generalEmail);


  // send notification
  const notification: Partial<SGMNotification.createDTO> = {
    name: 'Validación de Acompañamiento',
    message: `${mentor?.displayName?.toUpperCase()} ha registrado un nuevo acompañamiento, ayudanos validando.`,
    redirect: `/panel-control/${period?.reference?.id}/calificar-acompañamiento/${student.reference.id}/${id}/${reviewKey}`,
  }

  const tasks: Array<Promise<void>> = [saver.save(), SendNotification(studentUsername, notification)];

  await Promise.all(tasks);
}

export const mailAccompanimentReview = functions.firestore
  .document('accompaniments/{accompanimentId}')
  .onCreate(async (document, _) => {
    const accompaniment = (document.exists) ? document.data() as SGMAccompaniment.readDTO : null;

    if (!accompaniment)
      return;

    const tasks = [];

    tasks.push(notifyUserOfAccompaniment(accompaniment));

    // TODO: accompaniment tagged as important 
    // send notification to administrators
    // if (accompaniment.important)
    //   tasks.push(notifyAdminImportantAccompaniment(accompaniment));

    await Promise.all(tasks);
  });

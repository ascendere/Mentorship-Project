import firebase from 'firebase/app';
import { SGMAcademicArea } from "./academic-area";

export namespace SGMAcademicDegree {

    interface base {
        id: string;
        name: string;
        area: {
            reference: SGMAcademicArea.reference;
            name: string
        };
    }

    export type readDTO = base;

    export type reference = firebase.firestore.DocumentReference<base>;
}
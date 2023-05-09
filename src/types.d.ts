declare namespace Express {
    import { UserDoc } from "./models/User";

    export interface Request {
        user: UserDoc;
    }
}

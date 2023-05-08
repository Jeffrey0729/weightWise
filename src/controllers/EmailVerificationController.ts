import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';
import { updateEmailVerification } from '../models/UserModel';

async function verifyEmail(req: Request, res: Response): Promise<void> {
    const { userId } = req.session.authenticatedUser;
    const { verificationString } = req.params;
    let user = await getUserById(userId);

    if (!(userId)) {
        res.redirect('/login')
        return;
    }

    if (!(user.emailVerification.verificationString === verificationString)){
        res.redirect("/verification-failed.html")
        return;
    }

    if ((user.emailVerification.sentDate.getTime() - new Date().getTime()) > 1000 * 60 * 60){
        res.redirect("/verification-failed.html")
        return;
    }

    try {
        await updateEmailVerification(userId);
        let user = await getUserById(userId);
        req.session.authenticatedUser.verifiedEmail = user.verifiedEmail;
        res.redirect("/user/profile")
    } catch (err) {
        console.error(err);
        const databaseErrorMessage = parseDatabaseError(err);
        res.status(500).json(databaseErrorMessage);
    }

}

export { verifyEmail }

import {IIMAPClient} from "../interfaces";
import nodemailer from "nodemailer";

export default async function (
    client: IIMAPClient
): Promise<nodemailer.Transporter> {
    return nodemailer.createTransport({
        host: client.config.host,
        port: client.config.port,
        secure: client.config.secure,
        auth: {
            user: client.config.user,
            pass: client.config.password
        },
    });
}
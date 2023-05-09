import nodemailer from 'nodemailer';

const options = {
    host: process.env.NODEMAILER_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.NODEMAILER_PORT) || 2525,
    auth: {
        user: "c25640d74e73c5",
        pass: "150b99289a080c"
    }
};

const transport = nodemailer.createTransport(options);

export default transport;
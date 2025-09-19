import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { htmlToText } from "html-to-text";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Perica Bartulovic <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      })
    }

    // Dev: Mailtrap or local SMTP
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // helper to render base + content template
  renderTemplate(templateName, subject) {
    const basePath = path.join(__dirname, "../views/email/baseEmail.html");
    const contentPath = path.join(
      __dirname,
      `../views/email/${templateName}.html`
    );

    const base = fs.readFileSync(basePath, "utf8");
    const content = fs.readFileSync(contentPath, "utf8");

    const compiledContent = handlebars.compile(content);
    const renderedContent = compiledContent({
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const compiledBase = handlebars.compile(base);
    return compiledBase({
      firstName: this.firstName,
      url: this.url,
      subject,
      content: renderedContent,
    });
  }

  // send the actual email
  async send(template, subject) {
    const html = this.renderTemplate(template, subject);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html), // fallback plaintext
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Natours family!");
  }

  async sendPasswordReset(resetUrl) {
    this.url = resetUrl; // override with reset link
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
}

export default Email;

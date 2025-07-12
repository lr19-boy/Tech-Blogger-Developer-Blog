import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(sender_email, receiver_email, app_password, subject, body):
    msg = MIMEMultipart()
    msg["From"] = f"Tech Blogger <{sender_email}>"
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg["Reply-To"] = sender_email  # or user_email if replying to user
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.send_message(msg)
        server.quit()
        print("✅ Email sent successfully.")
        return True
    except Exception as e:
        print("❌ Failed to send email:", e)
        return False 
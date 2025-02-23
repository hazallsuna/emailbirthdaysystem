require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const csvFilePath = 'users.csv';

const today = new Date();
const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
        const { name, child_name, child_birthday, email } = row;

        const [month, day] = child_birthday.split('/').map(num => num.padStart(2, '0'));
        const formattedBirthday = `${month}-${day}`;

        if (formattedBirthday === todayMonthDay) {
            sendEmail(name, child_name, email);
        }
    })
    .on('end', () => {
        console.log('csv dosyası okundu');
    });

function sendEmail(name, child_name, email) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Çocuğunuzun Doğum Günü Kutlu Olsun! 🎉',
        html: `
            <p>Merhaba ${name},</p>
            <p>Bugün ${child_name}'in doğum günü! Onun için harika bir yıl olmasını dileriz. 🎂🎈</p>
            <p>Sevgiler,</p>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`E-mail gönderme hatası: ${error}`);
        } else {
            console.log(`E-mail gönderildi: ${info.response}`);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});

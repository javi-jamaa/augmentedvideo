'use strict';

var config = {
  port: 3000,
  secure_port: 8443,
  apiBaseURL: 'http://127.0.0.1:3000/agora/api/v1/members/',
  realm: 'mycompany',
  membersApiPageSize: 100,
  clients: {
    cleaner: {
      secret: 'mysecret',
      company: 'A'
    },
    test: {
      secret: 'secretString',
      company: 'B'
    }
  },
  github: {
    clientId: '',
    clientSecret: '',
    adminToken: '',
    callbackURL: 'http://localhost:3000/agora/auth/github/callback',
    orga: 'ouhyeah'
  },
  email: {
    host: '',
    port: 25,
    from: 'agora@telefonica.com',
    subject: 'A new member has joined github',
    text: 'The github user {username} with validated email {email} has been invited to join your team {team} at https://github.com/{orga}'
  },
  companies: {
    TID: {
      team: 'Telefonica I+D',
      adminEmail: '',
      allowedDomains: ['gmail.com', 'telefonica.com'],
      isUserValidService: {
        url: '',
        clientId: '',
        clientSecret: ''
      }
    },
    Tokbox: {
      team: 'Tokbox',
      adminEmail: '',
      allowedDomains: ['tokbox.com']
    },
    MailCo: {
      team: 'Otro',
      adminEmail: '',
      allowedDomains: ['gmail.com']
    }
  },
  userDatabase: './videos'
};

module.exports = config;

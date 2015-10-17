/**
 * Simple authentication and authorization module.
 */
const config = require('config'),
      crypto = require('crypto'),
      http = require('request-promise'),
      Q = require('q');

var crud = ['create', 'read', 'update', 'delete'];

var roles = {
  anonymous: {
    permissions: []
  },
  borrower: {
    permissions: [
        {resource: "items", operations: ['read']},
        {resource: "borrowers", operations: ['read'],
         check: function(user, action) {
             return true;
         }}
    ]
  },
  clerk: {
    permissions: [
      {resource: 'items', operations: ['read', 'checkin', 'checkout', 'renew']},
      {resource: 'borrowers', operations: ['read', 'payFees', 'renewAllItems']}
    ]
  },
  librarian: {
    permissions: [
      {resource: 'items', operations: crud.concat('checkin', 'checkout', 'renew')},
      {resource: 'borrowers', operations: crud.concat('payFees', 'renewAllItems')},
      {resource: 'fees', operations: crud},
      {resource: 'checkouts', operations: crud},
      {resource: 'reports', operations: crud}
    ]
  },
  admin: {
    permissions: [
      {resource: 'users', operations: crud},
      {resource: 'items', operations: crud.concat('checkin', 'checkout', 'renew')},
      {resource: 'borrowers', operations: crud},
      {resource: 'reports', operations: crud}
    ]
  }
};

var UNKNOWN_USER = {
    authenticated: false,
    reason: 'UNKNOWN_USER'
};

var INCORRECT_PASSWORD = {
    authenticated: false,
    reason: 'INCORRECT_PASSWORD'
};


module.exports = function (db) {

  function hash(s) {
    return crypto.createHash('sha256').update(s).digest('hex');
  }

  function saltedHash(s) {
    return hash(config.auth.salt + s);
  }

    function authenticateSycamore(login) {
        var options = {
            method: 'POST',
            uri: 'http://app.sycamoreeducation.com/index.php',
            form: {
                'entered_schid' : '2132',
                'entered_login': login.username,
                'entered_password': login.password
            },
            headers: {
            }
        };
        return http(options)
            .then(function (body) {
                return body.indexOf('Username / Password Incorrect') == -1;
            })
            .catch(function (err) {
                return false;
            });
    }

  function createAuthentication(user) {
      var permissions = [];
      user.roles.split(',').forEach(function (roleName) {
          var role = roles[roleName];
          if (role) {
              permissions = permissions.concat(role.permissions);
          }
      });
      return {
          authenticated: true,
          user: {
              username: user.username,
              roles: user.roles,
              permissions: permissions,
              borrowernumber: user.borrowernumber
          }
      };
  }

  /**
   * Authenticates a user given the login containing the 'username' and
   * 'password' against the database. If authenticated, returns the user
   * with his/her roles and permissions.
   */
  function authenticate(login) {
    return db.selectRow('select * from users where username = ?',
                        login.username, true)
      .then(function (user) {
        if (!user) {
            return db.selectRow(
                'select * from borrowers where sycamore_id = ?',
                login.username, true)
                .then(function (borrower) {
                    if (!borrower) {
                        return UNKNOWN_USER;
                    }
                    return authenticateSycamore(login)
                        .then(function(result) {
                            if (result) {
                                return createAuthentication({
                                    username: borrower.sycamore_id,
                                    roles: 'borrower',
                                    borrowernumber: borrower.borrowernumber
                                });
                            } else {
                                return INCORRECT_PASSWORD;
                            }
                        });
                });
        }
        if (saltedHash(login.password) !== user.hashed_password) {
            return INCORRECT_PASSWORD;
        }
        return createAuthentication(user);
      });
  }

  function logout() {
    return Q(true);
  }

  return {
    authenticate: authenticate,
    logout: logout,
    hashPassword: saltedHash
  };
};

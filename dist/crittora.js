"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crittora = void 0;
const authService_1 = require("./services/authService");
const encryptionService_1 = require("./services/encryptionService");
class Crittora {
    constructor() {
        this.authService = authService_1.AuthService.getInstance();
        this.encryptionService = encryptionService_1.EncryptionService.getInstance();
    }
    async authenticate(username, password) {
        return this.authService.authenticate(username, password);
    }
    async encrypt(idToken, data, permissions) {
        return this.encryptionService.encrypt(idToken, data, permissions);
    }
    async decrypt(idToken, encryptedData, permissions) {
        return this.encryptionService.decrypt(idToken, encryptedData, permissions);
    }
    async decryptVerify(idToken, encryptedData, permissions) {
        return this.encryptionService.decryptVerify(idToken, encryptedData, permissions);
    }
}
exports.Crittora = Crittora;
//# sourceMappingURL=crittora.js.map
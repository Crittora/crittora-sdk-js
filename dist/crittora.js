import { AuthService } from "./services/authService";
import { EncryptionService } from "./services/encryptionService";
export class Crittora {
    constructor() {
        this.authService = AuthService.getInstance();
        this.encryptionService = EncryptionService.getInstance();
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
//# sourceMappingURL=crittora.js.map
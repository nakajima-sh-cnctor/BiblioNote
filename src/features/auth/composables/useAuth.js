import { ref } from 'vue';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase';

const error = ref(null);
const isLoading = ref(false);

const login = async (email, password) => {
    error.value = null;
    isLoading.value = true;

    // const auth = getAuth(); // Removed, using imported instance

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        isLoading.value = false;
        return userCredential.user;
    } catch (err) {
        console.error(err);
        error.value = err.message;
        isLoading.value = false;
        throw err;
    }
};

const signup = async (email, password) => {
    error.value = null;
    isLoading.value = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        isLoading.value = false;
        return userCredential.user;
    } catch (err) {
        console.error(err);
        error.value = err.message;
        isLoading.value = false;
        throw err;
    }
};

const resetPassword = async (email) => {
    error.value = null;
    isLoading.value = true;

    try {
        await sendPasswordResetEmail(auth, email);
        isLoading.value = false;
    } catch (err) {
        console.error(err);
        error.value = err.message;
        isLoading.value = false;
        throw err;
    }
};

const useAuth = () => {
    return { error, isLoading, login, signup, resetPassword };
};

export default useAuth;

import { defineStore } from 'pinia';
import api from '@/api';
import router from '@/router';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null);
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);

    async function login(loginInput, password) {
        try {
            const res = await api.post('/login', {
                login: loginInput, // email or username
                password
            });
            console.log(res);
            if (res.data?.Success) { // check Success flag instead of token
                const userData = res.data.Data;

                // Save user in store and localStorage
                user.value = userData;
                token.value = res.data.Data.token || null;
                localStorage.setItem('token', token.value);
                localStorage.setItem('user', JSON.stringify(userData));

                // Redirect to account page
                router.push('/account/booking');
            } else {
                throw new Error(res.data?.Message || 'Login failed');
            }
        } catch (err) {
            user.value = null;
            console.error(err);
            throw err; // will be caught in component
        }
    }


    function logout() {
        token.value = null;
        user.value = null;
        localStorage.clear();
        router.push('/');
    }

    return { token, user, login, logout };
});

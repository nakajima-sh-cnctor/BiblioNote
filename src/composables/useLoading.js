import { ref } from 'vue'

const isLoading = ref(false)

export const useLoading = () => {
    const setLoading = (value) => {
        isLoading.value = value
    }

    return {
        isLoading,
        setLoading
    }
}

export const useToast = () => {
    const addToast = (message, type) => {
        console.log(`Toast [${type}]: ${message}`);
    };
    return { addToast };
};

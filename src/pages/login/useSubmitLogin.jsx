import axios from "axios";

export const useSubmitLogin = () => {
    const beUrl = process.env.REACT_APP_API_URL;
    const onSubmit = (data) => {
        e.preventDefault();
        console.log('this is form data', data);
        setTimeout(() => {
        }, 100000)
        // try {
        //     axios({
        //         method: "POST",
        //         data: {
                    
        //         }
        //     })
        // } catch (error) {}
    };
    return {
        onSubmit,
    }
};
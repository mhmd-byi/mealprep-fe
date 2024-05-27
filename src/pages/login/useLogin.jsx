// import axios from "axios";

// export const useSubmitLogin = () => {
//     const beUrl = process.env.REACT_APP_API_URL;
//     const onSubmit = (data) => {
//         e.preventDefault();
//         console.log('this is form data', data);
//         setTimeout(() => {
//         }, 100000)
//         // try {
//         //     axios({
//         //         method: "POST",
//         //         data: {
                    
//         //         }
//         //     })
//         // } catch (error) {}
//     };
//     return {
//         onSubmit,
//     }
// };


import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
    const navigate = useNavigate();
    const [loaderState, setLoaderState] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    // const handleSubmit = (e, navigatetoDashboardProfile) => {
    //     e.preventDefault();
    //     navigatetoDashboardProfile = () => navigate ('/dashboard/profile')
    //     setLoaderState(true);
    //     // axios({
    //     //     method: 'POST',
    //     //     params: {
    //     //         email: formData.email,
    //     //         password: formData.password,
    //     //     },
    //     //     url: `${process.env.REACT_APP_API_URL}auth/login`,
    //     // }).then((res) => {
    //     //     setLoaderState(false);
    //     //     sessionStorage.setItem('token', res.data.tokens.access.token);
    //     //     sessionStorage.setItem('refreshToken', res.data.tokens.refresh.token);
    //     //     sessionStorage.setItem('tokenExpireDate', res.data.tokens.access.expires);
    //     //     sessionStorage.setItem('userId', res.data.user.id);
    //     //     navigate('/dashboard/profile');
    //     // }).catch(() => {
    //     //     setLoaderState(false);
    //     //     setErrMsg('Invalid email or password')
    //     // })

    //     console.log('Login Submit data', formData);
    // }


    const handleSubmit = (e) => {
        e.preventDefault();
        setLoaderState(true);

        // Simulate API call with setTimeout
        setTimeout(() => {
            setLoaderState(false);
            // Mock response data
            const mockResponse = {
                tokens: {
                    access: {
                        token: 'mockAccessToken',
                        expires: 'mockExpirationDate',
                    },
                    refresh: {
                        token: 'mockRefreshToken',
                    },
                },
                user: {
                    id: 'mockUserId',
                },
            };

            // Assuming successful login
            sessionStorage.setItem('token', mockResponse.tokens.access.token);
            sessionStorage.setItem('refreshToken', mockResponse.tokens.refresh.token);
            sessionStorage.setItem('tokenExpireDate', mockResponse.tokens.access.expires);
            sessionStorage.setItem('userId', mockResponse.user.id);
            navigate('/dashboard/profile');

            // Uncomment below line to simulate error
            // setErrMsg('Invalid email or password');
        }, 1000); // Simulate a 1 second delay

        console.log('Login Submit data', formData);
    }

    return {
        handleSubmit,
        handleChange,
        formData,
        loaderState,
        errMsg,
    }
};
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useSignup = () => {
    const navigate = useNavigate();
    const [loaderState, setLoaderState] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        postalAddress: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoaderState(true);
        // axios.post(`${process.env.REACT_APP_API_URL}auth/register`, {
        //     data: {
        //         name: formData.name,
        //         email: formData.email,
        //         username: formData.username,
        //         phone: formData.mobile,
        //         password: formData.password,
        //     }
        // }).then((res) => {
        //     setLoaderState(false);
        //     sessionStorage.setItem('token', res.data.tokens.access.token);
        //     sessionStorage.setItem('refreshToken', res.data.tokens.refresh.token);
        //     sessionStorage.setItem('tokenExpireDate', res.data.tokens.access.expires);
        //     sessionStorage.setItem('userId', res.data.user.id);
        //     navigate('/dashboard');
        // }).catch((err) => {
        //     setErrMsg(err.response.data.message);
        // })
        console.log('signup form data', formData)
    };

    return {
        formData,
        handleChange,
        handleSubmit,
        errMsg,
        loaderState
    }
};
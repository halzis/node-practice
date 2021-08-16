import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { auth } from '../_actions/user_action'

// eslint-disable-next-line
export default function (SpecificComponent, option, adminRoute = null) {
    // option
    // null -> 아무나 출입 가능한 페이지
    // true -> 로그인한 유저만 출입이 가능한 페이지
    // false -> 로그인한 유저는 출입이 불가능한 페이지
    // adminRoute -> 어드민만 출입 가능하면 true
    function AuthenticationCheck(props) {
        const dispatch = useDispatch();
        
        useEffect(() => {
            dispatch(auth()).then(response => {
                console.log(response)

                // 로그인하지 않은 상태
                if(!response.payload.isAuth) {
                    if(option) {
                        props.history.push('/login')
                        alert("로그인하고 접속해주세요.")
                    }
                } else {
                    // 로그인한 상태
                    if(adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                        alert("admin 권한이 없습니다.")
                    } else {
                        if(!option) {
                            props.history.push('/')
                            alert("로그아웃하고 접속해주세요.")
                        }
                    }
                }
            })
        }, [])
        return (
            <SpecificComponent />
        )
    }

    return AuthenticationCheck
}
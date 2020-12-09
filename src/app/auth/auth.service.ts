import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email:string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?:boolean
}

@Injectable({providedIn:'root'})

export class AuthService {
    // public user = new Subject<User>();
    public user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;
    constructor(private http: HttpClient, private router: Router){}
    private ErrorMessageDefination(errorCode){
        switch(errorCode){
          case 'EMAIL_EXISTS':
            return 'Email already exist';
          case 'OPERATION_NOT_ALLOWED':
            return 'Try after sometime'
          case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            return 'Try after sometime'
          default:
            return 'Something went wrong, try after sometime'
        }
      }

    public signup(email: string, password: string){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAKJWqFPImQsXRqDM45ZlNkserYNd0Eki0',
        {
            email:email,
            password: password,
            returnSecureToken: true
        })
        .pipe(catchError(error=>{
            let errorMsg = 'Unknown error occured';
            if(!error.error || !error.error.error){
                return throwError(errorMsg);
            }
            errorMsg = this.ErrorMessageDefination(error.error.error.message);
            return throwError(errorMsg);
        }
        ), tap(resp=>{
            this.handleAuthentication(resp.email, resp.localId, resp.idToken, +resp.expiresIn)
        }))
    }
    public login(email:string, password: string){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAKJWqFPImQsXRqDM45ZlNkserYNd0Eki0',
        {
            email:email,
            password: password,
            returnSecureToken: true  
        })
        .pipe(catchError(error=>{

        
            let errorMsg = 'Unknown error occured';
            if(!error.error || !error.error.error){
                return throwError(errorMsg);
            }
            errorMsg = this.ErrorMessageDefination(error.error.error.message);
            return throwError(errorMsg);
        }
        ), tap(resp=>{
            console.log('resp===>',resp)
            this.handleAuthentication(resp.email, resp.localId, resp.idToken, +resp.expiresIn)
        }))

    }

    private handleAuthentication(email:string, localId: string, token: string, expireIn:number){
        let expire = new Date(new Date().getTime() + expireIn*1000);
            const user = new User(email,localId, token, expire);
            this.user.next(user);
            this.autoLogout( expireIn*1000);
            localStorage.setItem('userDetails', JSON.stringify(user))
    }
public autoLogin = () =>{
    let userDetails:{
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string

    } = JSON.parse(localStorage.getItem('userDetails'));

    if(!userDetails){
        return
    }
    const loadedUser = new User(userDetails.email, userDetails.id, userDetails._token, new Date(userDetails._tokenExpirationDate));

    if(loadedUser.tokenName){
        this.user.next(loadedUser);
        let expireTime = new Date(userDetails._tokenExpirationDate).getTime() - new Date().getTime();
        this.autoLogout(expireTime);
    }

}

    public Logout = () =>{
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userDetails');
        if(this.tokenExpirationTimer){
            clearTimeout(this.tokenExpirationTimer);
            
        }
        this.tokenExpirationTimer = null;
    }
public autoLogout(expirationDuration: number){
    this.tokenExpirationTimer = setTimeout(()=>{
        this.Logout();
    }, expirationDuration)
}

    // private handleError(error:HttpErrorResponse){
    //     let errorMsg = 'Unknown error occured';
    //         if(!error.error || !error.error.error){
    //             return throwError(errorMsg);
    //         }
    //         errorMsg = this.ErrorMessageDefination(error.error.error.message);
    //         return throwError(errorMsg);
    // }


}
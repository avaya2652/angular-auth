import { Component, Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  constructor(private authService: AuthService, private router:Router){}

  public isSignin: boolean = false;
  public isLoading: boolean = false;
  public errorMsg:string = '';

  public modeChange = () =>{
    this.isSignin = !this.isSignin;
  }


  public onSubmitHandler (form: NgForm){
    this.isLoading = true;
    if(!form.valid){
      return;
    }
    const email = form.value.email;
    const pass = form.value.password;
    let authObs: Observable<AuthResponseData>

    if(this.isSignin){
      authObs = this.authService.login(email, pass)
    }
    else{
      authObs = this.authService.signup(email, pass)
      }
    authObs.subscribe(
      respData =>{
        this.isLoading = false;
        this.router.navigate(['/recipes'])
        console.log(respData);
      },
      error =>{
        this.isLoading = false;
        this.errorMsg = error;
      }
    )
    form.reset();
  }
}

import { tokenName } from "@angular/compiler"

export class User{
    constructor(
        public email:string,
        public id: string,
         private _token: string, 
         private _tokenExpirationDate: Date){}

get tokenName(){
    console.log(1111111111111111);
    if(!this._tokenExpirationDate || new Date() > this._tokenExpirationDate){
        return null;
    }
    return this._token;
}

}

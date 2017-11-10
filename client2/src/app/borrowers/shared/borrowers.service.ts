import { Injectable } from '@angular/core';
import { RpcService } from "../../core/rpc.service";
import { Observable } from "rxjs";
import { Borrower } from "./borrower";
import { FetchResult } from "../../core/fetch-result";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormService } from "../../core/form.service";

@Injectable()
export class BorrowersService {

  constructor(private rpc: RpcService, private formService: FormService) {
  }

  getBorrowerFields(selected?:Array<string>): Observable<Array<FormlyFieldConfig>> {
    return this.rpc.httpGet('borrowers/fields')
      .map((cols: any) => {
        var fields = this.formService.formlyFields(cols);
        if (selected !== undefined) {
          return fields
            .filter(field => selected.includes(field.key))
            .sort((f1, f2) => selected.indexOf(f1.key) -
                  selected.indexOf(f2.key));
        }
        return fields;
      });
  }

  /**
   * Gets a single Borrower identified by id (borrowernumber).
   */
  getBorrower(id: number, params?): Observable<Borrower> {
    return this.rpc.httpGet('borrowers/' + id, params)
        .map(obj => Object.assign(new Borrower(), obj));
  }

  getBorrowers(criteria, offset, limit, returnCount): Observable<FetchResult> {
    return this.rpc.fetch('borrowers', criteria, offset, limit, returnCount);
  }

  checkOutItem(barcode, borrowerNumber) {
    return this.rpc.httpPost('items/' + barcode + '/checkout', {borrower: borrowerNumber});
  }

  addBorrower(borrower): Observable<Borrower> {
    const storedBorrower = Object.assign({}, borrower);
    return this.rpc.httpPost('/borrowers', storedBorrower)
      .map(obj => Object.assign(new Borrower(), obj));
  }

  saveBorrower(borrower) {
    const storedBorrower = Object.assign({}, borrower);
    return this.rpc.httpPut('/borrowers', storedBorrower)
      .map(obj => Object.assign(new Borrower(), obj));
  }

  getMyBorrower() {
    return this.rpc.httpGet('me')
        .map(obj => Object.assign(new Borrower(), obj));
  }
}

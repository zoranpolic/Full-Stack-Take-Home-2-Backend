'use strict';

const expect  = require('chai').expect;
const axios = require('axios');

let body = {
    firstName: "Steve",
    lastName: "Jobs",
    hireDate: "1980-06-15",
    role: "vp"
}

const baseUrl = 'http://localhost:3000/api/employees';

const postNewEmployee = (url, body) => {
    return axios
        .post(url, body, {crossDomain: true})
        .then(res => res)
        .catch(error => console.log(error));
}

const getAllEmployees = (url) => {
    return axios
        .get(url)
        .then(res => res)
        .catch(error => console.log(error));
}

describe('Employees tests', () => {

    it('Create new employee', () => {
        return postNewEmployee(baseUrl, body)
            .then(res => {
                expect(res.status).to.equal(200);
            })
    });

    it('Get all employees', () => {
        return getAllEmployees(baseUrl)
            .then(res => {
                expect(res.status).to.equal(200);
            })
    });
});
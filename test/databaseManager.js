import {DataBaseManager} from "../src/database/DatabaseManager.js"
import chai from 'chai';
import {Administrator} from "../src/database/modele/Users.js";
import {Discussion} from "../src/database/modele/Discussion.js";
import {Question} from "../src/database/modele/Question.js";
import {Device} from "../src/database/modele/Device.js";
import {Response} from "../src/database/modele/Response.js";

const expect = chai.expect;
const should = chai.should();

describe('Data Base manager test', () => {
    const db = new DataBaseManager();

    before(async () => {
        db.start();
        let user = null;

        const admin = new Administrator({
            login: 'admin',
            password: 'pass'
        });
        await admin.save().then((userSaved) => {
            console.log("administrator saved : ", userSaved);
            user = userSaved;
        });

        const discussion1 = new Discussion({
            _id: 1,
            title: "Debate1",
            description: "My First Debate",
            startTime: new Date(),
            administrator: user._id
        });
        await discussion1.save().then((discussionSaved) => {
            console.log("discussion saved : ", discussionSaved);
        });

        const discussion2 = new Discussion({
            _id: 2,
            title: "Debate2",
            description: "My Second Debate",
            startTime: new Date(),
            administrator: user._id
        });
        await discussion2.save().then((discussionSaved) => {
            console.log("discussion saved : ", discussionSaved);
        });

        const question1 = new Question({
            _id: 1,
            titreQuestion: "Question for debate 1",
            numberVotes: 0,
            refDiscussion: discussion1._id
        });
        await question1.save().then((questionSaved) => {
            console.log("question saved : ", questionSaved);
        });

        const question2 = new Question({
            _id: 2,
            titreQuestion: "Question 2 for debate 1",
            numberVotes: 0,
            refDiscussion: discussion1._id
        });
        await question2.save().then((questionSaved) => {
            console.log("question saved : ", questionSaved);
        });

        const device = new Device({
            _id: "110e8400-e29b-11d4-a716-446655440000"
        });
        await device.save().then((deviceSaved) => {
            console.log("device saved : ", deviceSaved);
        });

        const response1 = new Response({
            _id: 1,
            response: "Yes",
            refQuestion: question1._id,
            devices: [{
                refDevice: device._id
            }]
        });
        await response1.save().then((responseSaved) => {
            console.log("response saved : ", responseSaved);
        });

        const response2 = new Response({
            _id: 2,
            response: "No",
            refQuestion: question1._id,
        });
        await response2.save().then((responseSaved) => {
            console.log("response saved : ", responseSaved);
        });
    });

    // When testing this function make sure that in your DB the user admin exists
    describe('Get password of user test', () => {
        it('Get password of user admin', (done) => {
            const username = "admin";
            db.getAdminPassword(username).then( function(password) {
                    console.log(password);
                    password.should.equal("pass");
                    done();
                }
            );
        });
    });

    describe('Get debate of user test', () => {
        it('Get debate of user admin', (done) => {
            const username = "admin";
            db.getDiscussionsAdmin(username).then(function(discussions){
                let i = 1;
                for(let disucssion of discussions){
                    disucssion._id.should.equal(i);
                    i++;
                }
                done();
            });
        });
    });

    describe('Get questions from a debate', () => {
        it('Get Question from debate 1', (done) => {
            db.getQuestionsDiscussion(1).then(function(questions){
                let i = 1;
                for(let question of questions){
                    question._id.should.equal(i);
                    i++;
                }
                done();
            });
        });
    });

    describe('Get responses from a device', () => {
        it('Get Responses from device', (done) => {
            db.getResponsesDevice("110e8400-e29b-11d4-a716-446655440000").then(function(responses){
                responses[0]._id.should.equal(1);
                responses[0].response.should.equal("Yes");
                done();
            });
        });
    });

    describe('Get all responses from a Question', () => {
        it('Get Responses from Question', (done) => {
            db.getResponsesQuestion(1).then(function(responses){
                let i = 1;
                for(let response of responses){
                    response._id.should.equal(i);
                    i++;
                }
                done();
            });
        });
    });

    after((done) => {
        db.end();
        done();
    });
});
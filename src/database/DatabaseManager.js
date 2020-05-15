import mongoose from 'mongoose';
import {Device} from './modele/Device.js';
import {Discussion} from './modele/Discussion.js';
import {Participant} from './modele/Participant.js';
import {Question} from './modele/Question.js';
import {Response} from './modele/Response.js';
import {Tag} from './modele/Tag.js';
import {Administrator,Moderator,Presentator,UserModerator} from './modele/Users.js';
import {logger} from '../conf/config.js';
import {QuestionAdmin} from "./modele/QuestionAdmin.js";
import {QuestionSuggestion} from "./modele/QuestionSuggestion.js";

/**
 * This class is used to manage the database communication.
 */
export class DataBaseManager {

    /**
     * Start the DataBaseManager by connecting to the mongoDB instance
     */
    start() {
        // Connection to the local database
        mongoose.connect('mongodb://localhost:27017/PRO', {useNewUrlParser: true, useUnifiedTopology: true});
        mongoose.set('useCreateIndex', true);
    }

    /**
     * Close the connection to the database
     */
    async end(){
        // Close the connection
        await mongoose.connection.close();
    }

    /**
     * Get the password of an administrator
     * @param username String that is the username of the administrator
     * @returns a String that is the result of the request for the password or null if password not found
     */
    async getAdminPassword(username){
        let password = null;
        logger.debug(`Getting the password of the user ${username}`);
        let user = await Administrator.findOne({login:username},function(err,username) {
            if (err || username == null) logger.debug(`Impossible to find username`);
            else{
                logger.debug(`User found: ${username}`);
            }
        });
        if(user != null){
            password = user.password;
        }
        return password;
    }

    /**
     * Get the id of an administrator
     * @param username String that is the username of the administrator
     * @returns a String that represents the id of the user or null if username not found
     */
    async getAdminId(username){
        let id = null;
        logger.debug(`Getting the id of the user ${username}`);
        let user = await Administrator.findOne({login:username},function(err,username) {
            if (err || username == null) logger.debug(`Impossible to find username`);
            else{
                logger.debug(`User found: ${username}`);
            }
        });
        logger.info(user);
        if(user != null){
            id = user._id;
        }
        logger.info(id);
        return id;
    }

    /**
     * Get a discussion stored in the database with the corresponding id
     * @param anIdDiscussion integer that represents the id of the discussion desired
     * @returns {Promise<Query|void>} A Discussion or null if not found
     */
    async getDiscussion(anIdDiscussion){
        logger.debug(`Getting the Discussion with id ${anIdDiscussion}`);
        // Get the discussions related to the id
        return Discussion.findOne({_id: anIdDiscussion}, function (err, discussion) {
            if (err || discussion == null) logger.debug(`Error when requesting discussion`);
            else {
                console.log(discussion);
            }
        });
    }

    /**
     * Get a question of a user stored in the database with the corresponding id
     * @param anIdQuestion integer that represents the id of the question desired
     * @param anIdDiscussion integer that represents the id of the discussion related to the question
     * @returns {Promise<Query|void>} A Question or null if not found
     */
    async getUserQuestion(anIdQuestion, anIdDiscussion){
        logger.debug(`Getting the Question with id ${anIdQuestion}`);
        // Get the discussions related to the id
        return QuestionSuggestion.findOne({"id.refQuestion": anIdQuestion, "id.refDiscussion": anIdDiscussion}, function (err, question) {
            if (err || question == null) logger.debug(`Error when requesting question`);
            else {
                console.log(question);
            }
        });
    }

    // TODO : Get all accepted question
    // TODO : Get all not yet accepted question

    /**
     * Get the discussions of an administrator
     * @param username String that is the username of the administrator
     * @returns a Array of Discussion that represents the discussions started by an user
     */
    async getDiscussionsAdmin(username){
        let discussions = null;
        // Get the id of the username passed in parameter
        let adminId = await this.getAdminId(username);
        // If the adminId is null the username is unknown
        if(adminId == null){
            logger.debug(`Error when looking for username id`);
        }
        else {
            logger.debug(`Getting the Discussions from ${username}`);
            // Get all the discussions related to the user
            discussions = await Discussion.find({administrator: adminId}, function (err, discussions) {
                if (err || discussions == null) logger.debug(`Error when requesting discussions`);
                else{
                    console.log(discussions);
                }
            });
        }
        return discussions;
    }

    // TODO: Test for the function will do it in the next PR
    /**
     * Get the closed discussions of an administrator
     * @param username String that is the username of the administrator
     * @returns a Array of Discussion that represents the discussions started by an user
     */
    async getClosedDiscussionsAdmin(username){
        let discussions = null;
        // Get the id of the username passed in parameter
        let adminId = await this.getAdminId(username);
        // If the adminId is null the username is unknown
        if(adminId == null){
            logger.debug(`Error when looking for username id`);
        }
        else {
            logger.debug(`Getting the Discussions from ${username}`);
            // Get all the discussions related to the user
            discussions = await Discussion.find({administrator: adminId, finishTime: {$exists: true}}, function (err, discussions) {
                if (err) {
                    logger.debug(`Error when requesting discussions`);
                }else if(discussions == null){
                    logger.debug(`No debates were found`);
                }else{
                    console.log(discussions);
                }
            });
        }
        return discussions;
    }

    /**
     * Get the questions from discussion
     * @param anIDDebate Integer that is the id of the debate that we want to get the questions from
     * @returns a Array of Questions that represents the questions related to the discussion
     */
    async getQuestionsDiscussion(anIDDebate){
        let questions = null;
        // If id is null error
        if(anIDDebate == null){
            logger.debug(`Error Debate ID cannot be null`);
        }
        else {
            logger.debug(`Getting the Questions from discussions ${anIDDebate}`);
            // Get all the questions from the DB from the desired debate
            questions = await Question.find({refDiscussion: anIDDebate}, function (err, questions) {
                if (err || questions == null) logger.debug(`Error when requesting questions`);
                else{
                    console.log(questions);
                }
            });
        }
        return questions;
    }

    /**
     * Get the responses from a device
     * @param aUUID String that is the UUID of the device that we want to get the responses from
     * @returns an Array of Responses that represents the responses related to the Device
     */
    async getResponsesDevice(aUUID){
        let responses = null;
        // If id is null error
        if(aUUID == null){
            logger.debug(`Error UUID cannot be null`);
        }
        else {
            logger.debug(`Getting the Responses from Device ${aUUID}`);
            // Get all the responses from the DB from the desired device
            responses = await Response.find({"devices.refDevice": aUUID}, function (err, responses) {
                if (err || responses == null) logger.debug(`Error when requesting responses`);
                else{
                    logger.debug(responses);
                }
            });
        }
        return responses;
    }

    /**
     * Get all responses from a question
     * @param aIDQuestion String that is the UUID of the device that we want to get the responses from
     * @returns an Array of Responses that represents the responses related to the Device
     */
    async getResponsesQuestion(aIDQuestion){
        let responses = null;
        // If id is null error
        if(aIDQuestion == null){
            logger.debug(`Error Question ID cannot be null`);
        }
        else {
            logger.debug(`Getting the Responses from Question ${aIDQuestion}`);
            // Get all the responses from the DB from the desired device
            responses = await Response.find({refQuestion: aIDQuestion}, function (err, responses) {
                if (err || responses == null) logger.debug(`Error when requesting responses`);
                else{
                    logger.debug(responses);
                }
            });
        }
        return responses;
    }

    /**
     * Get the id of the latest discussion
     */
    async getLastDiscussionId() {
        logger.debug('getLastDiscussionId called');
        return new Promise(resolve => {
            Discussion.find().sort({_id: 'descending'}).exec((err, discussions) => {
                if (err) {
                    logger.debug('getLastDiscussionId returning 0');
                    resolve(0);
                } else {
                    logger.debug(`getLastDiscussionId returning ${discussions[0]._id}`);
                    resolve(discussions[0]._id);
                }
            });
        });
    }

    /**
     * Save a discussion in the database
     * @param discussion object Debate that represents the discussion to save in the databse
     * @returns {Promise<boolean>} true if the saving was successful false otherwise
     */
    async saveDiscussion(discussion){
        // Show the Disucssion that will be saved
        console.log(discussion);
        let saved = true;
        // Search for the admin id of the discussion
        let idAdmin = await this.getAdminId(discussion.admin);
        if(idAdmin == null){
            logger.debug(`Error when looking for username id`);
            return false;
        }
        /* Search for participants is not enable for the moment because participant are not implemented in the server
        var arr = [];
        for(var key of discussion.participant.keys()){
            arr.push({refParticipant: key });
        }
        */
        // Creation of object Discussion with desired values
        const discussion1 = new Discussion({
            _id: discussion.debateID,
            title: discussion.title,
            description: discussion.description,
            startTime: new Date(),
            auditors: 0,
            administrator: idAdmin
        });
        // Try to save the discussion in database
        await discussion1.save()
              .then(discussionSaved => logger.debug(`Discussion saved ${discussionSaved}`))
              .catch(err => {
                            logger.debug(`Error when saving Disucssion`);
                            console.log(err);
                            saved = false
              });
        logger.debug(`saved = ${saved}`);
        // If the save function failed exit the function with false
        if(!saved){
            return saved;
        }
        // Save all the questions related to the discussion
        for(let key of discussion.questions.keys()){
            let savedState = await this.saveQuestion(discussion.questions.get(key), discussion.debateID);
            // If one of the questions fail to save exit the function with false
            if(!savedState){
                return false;
            }
        }
        return saved;
    }

    /**
     * Update a discussion when the discussion is closed.
     * Save the finish time and the number of auditors.
     * @param discussion object of the class Discussion
     * @returns {Promise<boolean>} true if the update in the database went well false otherwise
     */
    async saveEndDiscussion(discussion){
        if(discussion.id != null) {
            // Get the current state of the discussion in the database
            let debate = await this.getDiscussion(discussion.id);
            // If debate is null the discussion does not exist in the database so we exit with error
            if(debate == null){
                logger.debug(`Error when updating discussion. Discussion not found`);
                return false;
            }
            logger.debug(`Updating discussion : ${debate}`);
            // Update the field finishTime and auditors
            debate.finishTime = new Date();
            // Will be changed by an attribute in the debate class
            debate.auditors = 57;
            let update = true;
            // Update the discussion in the database
            await debate.save()
            .then(debateUpdated => {
                logger.debug(`Discussion updated saved ${debateUpdated}`);
            }).catch(err => {
                logger.debug(`Error when updating discussion id = ${debate.id}`);
                console.log(err);
                update = false
            });
            return update;
        }
        return false;
    }

    /**
     * Save a question in the database
     * @param question object Question that represents the Question to save
     * @param idDiscussion integer that is the id of the Discussion related to the question
     * @returns {Promise<boolean>} true if the save went well false otherwise
     */
    async saveQuestion(question, idDiscussion){
        let saved = true;
        const questionSave = new Question({
            id: question.id,
            titreQuestion: question.title,
            refDiscussion: idDiscussion
        });
        // Save the question in database
        await questionSave.save()
            .then(questionSaved => logger.debug(`Question saved ${questionSaved}`))
            .catch(err => {
                logger.debug(`Error when saving Question id = ${question.id}`);
                console.log(err);
                saved = false;
            });
        // If the save went wrong we exit the function and return false;
        if(!saved){
            return false;
        }
        // Save all the responses related to the question
        for (let i = 0; i < question.answers.length; ++i) {
            let savedState = await this.saveResponse(i, question.answers[i].answer, question.id, idDiscussion);
            if(!savedState){
                return false;
            }
        }
        return saved;
    }

    /**
     * Save a question of an admin in the database
     * @param question object Question that represents the Question to save
     * @param idDiscussion integer that is the id of the Discussion related to the question
     * @param username String that is the username of the admin
     * @returns {Promise<boolean>} true if the save went well false otherwise
     */
    async saveQuestionAdmin(question, idDiscussion, username){
        let saved = await this.saveQuestion(question,idDiscussion);
        if(!saved){
            return false;
        }
        // Save the question as an admin Question in the database
        let idAdmin = await this.getAdminId(username);
        if(idAdmin == null){
            logger.debug(`Error when looking for username id`);
            return false;
        }
        logger.info(`my id ${idAdmin}`);
        const questionAdminSave = new QuestionAdmin({
            id: {
                refQuestion: question.id,
                refDiscussion: idDiscussion
            },
            administrator: idAdmin
        });

        await questionAdminSave.save()
            .then(questionAdminSave => logger.debug(`Question of admin saved ${questionAdminSave}`))
            .catch(err => {
                logger.debug(`Error when saving Question of admin id = ${question.id}`);
                console.log(err);
                saved = false;
            });
        // If the save went wrong we exit the function and return false;
        if(!saved){
            return false;
        }
        return saved;
    }

    /**
     * Save a question suggested by a user in the database
     * @param question object Question that represents the Question to save
     * @param idDiscussion integer that is the id of the Discussion related to the question
     * @returns {Promise<boolean>} true if the save went well false otherwise
     */
    async saveQuestionUser(question, idDiscussion){
        let saved = await this.saveQuestion(question,idDiscussion);
        if(!saved){
            return false;
        }
        const questionSuggestionSave = new QuestionSuggestion({
            id: {
                refQuestion: question.id,
                refDiscussion: idDiscussion
            }
        });

        await questionSuggestionSave.save()
            .then(questionAdminSave => logger.debug(`Question of user saved ${questionAdminSave}`))
            .catch(err => {
                logger.debug(`Error when saving Question of user id = ${question.id}`);
                console.log(err);
                saved = false;
            });
        // If the save went wrong we exit the function and return false;
        if(!saved){
            return false;
        }
        return saved;
    }

    async saveApprovedQuestion(questionId, disucssionId){
        let questionUser = await this.getUserQuestion(questionId,disucssionId);

        if(questionUser == null){
            logger.debug(`Error when updating question. Question not found`);
            return false;
        }
        logger.debug(`Updating question : ${questionUser}`);
        // Update the field finishTime and auditors
        questionUser.approved = true;
        let update = true;
        // Update the discussion in the database
        await questionUser.save()
            .then(debateUpdated => {
                logger.debug(`Question suggestion updated saved ${debateUpdated}`);
            }).catch(err => {
                logger.debug(`Error when updating question suggestion id = ${debate.id}`);
                console.log(err);
                update = false
            });
        return update;
    }

    /**
     * Save the response in the database
     * @param responseId the id of response that need to be saved
     * @param response the response that need to be saved
     * @param questionId integer that is the id of the question related to the response
     * @param discussionId integer that is the id of the discussion related to the response
     * @returns {Promise<boolean>} true if save went well false otherwise
     */
    async saveResponse(responseId, response, questionId, discussionId){
        let saved = true;
        const responseSave = new Response({
            id: responseId,
            response: response,
            refQuestion: {
                refQuestion: questionId,
                refDiscussion: discussionId
            }
        });
        // Save the response in database
        await responseSave.save()
            .then(responseSaved => logger.debug(`Response saved ${responseSaved}`))
            .catch(err => {
                logger.debug(`Error when saving Response id = ${responseId}`);
                console.log(err);
                saved = false;
            });
        return saved;
    }

    // TODO : Remove Question from DB if not accepted
}

export const dbManager = new DataBaseManager();

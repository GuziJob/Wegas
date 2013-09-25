//Global variable for easy use
importPackage(javax.naming);
var gm = self.getGameModel(), testMode = true;
steps = 10, minTaskDuration = 0.1;

/**
 * Call all necessary method to pass a period and calculate all variable.
 * set phase (if period egal max period) and set period.
 * if enter in phase 2, change pageGantt and pageTask then call function setWeekliesVariables
 * to calculate values like gauges and EV, AC, ...
 * if period is passed in phase realisation, calculate task progress (call
 *  function completeRealizationPeriod) and check the end of the project (if true, pass to phase 4).
 */
function nextPeriod() {
    var time = getCurrentInGameTime(), phase = VariableDescriptorFacade.findByName(gm, 'currentPhase'),
            ganttPage, taskPage, phases;
    phases = VariableDescriptorFacade.findByName(gm, 'currentPeriod');
    if (time.period === parseInt(phases.items.get(time.phase).getMaxValue())) { // if end of phase
        phases.items.get(time.phase).getInstance(self).setValue(1);
        phase.getInstance(self).setValue(time.phase + 1);
        if (parseInt(phase.getInstance(self).getValue()) === 2) {
            ganttPage = VariableDescriptorFacade.findByName(gm, 'ganttPage');
            ganttPage.getInstance(self).setValue(11);
            taskPage = VariableDescriptorFacade.findByName(gm, 'taskPage');
            taskPage.getInstance(self).setValue(12);
        }
    } else if (time.phase === 2) { //if current phase is the 'realisation' phase
        completeRealizationPeriod();
        if (checkEndOfProject()) { //if the project ended
            phases.items.get(time.phase).getInstance(self).setValue(1);
            phase.getInstance(self).setValue(time.phase + 1);
        } else {
            phases.items.get(time.phase).getInstance(self).setValue(time.period + 1);
        }
        setWeekliesVariables();
    } else {
        phases.items.get(time.phase).getInstance(self).setValue(time.period + 1);
    }
}

/**
 * Check if all active task is complete (Completeness > 100).
 * @returns {Boolean} true if the project is ended
 */
function checkEndOfProject() {
    var i, taskInst, tasks = VariableDescriptorFacade.findByName(gm, 'tasks'), isTheEnd = true;
    for (i = 0; i < tasks.items.size(); i++) {
        taskInst = tasks.items.get(i).getInstance(self);
        if (isTrue(taskInst.getActive()) && parseInt(taskInst.getProperty('completeness')) < 100) {
            isTheEnd = false;
            break;
        }
    }
    return isTheEnd;
}

/**
 * Divide period in steps (see global variable).
 * Call function calculTasksProgress at each step.
 */
function completeRealizationPeriod() {
    var i;
    if (testMode) {
        println('==============================');
        println('==============================');
    }
    for (i = 0; i < steps; i++) {
        calculTasksProgress(i);
        if (testMode) {
            println('---');
        }
    }
}

/**
 * Calculate planedValue, earnedValue, actualCost, projectCompleteness, save
 *  history for variable the same variable and for costs, delay and quality.
 *  call function updateGauges();
 */
function setWeekliesVariables() {
    var i, taskInst, ev = 0, pv = 0, ac = 0, sumProjectCompleteness = 0,
            tasks = VariableDescriptorFacade.findByName(gm, 'tasks'),
            costs = VariableDescriptorFacade.findByName(gm, 'costs'),
            delay = VariableDescriptorFacade.findByName(gm, 'delay'),
            quality = VariableDescriptorFacade.findByName(gm, 'quality'),
            planedValue = VariableDescriptorFacade.findByName(gm, 'planedValue'),
            earnedValue = VariableDescriptorFacade.findByName(gm, 'earnedValue'),
            actualCost = VariableDescriptorFacade.findByName(gm, 'actualCost'),
            projectFixCosts = VariableDescriptorFacade.findByName(gm, 'projectFixedCosts'),
            projectCompleteness = VariableDescriptorFacade.findByName(gm, 'projectCompleteness');
    for (i = 0; i < tasks.items.size(); i++) {
        taskInst = tasks.items.get(i).getInstance(self);
        sumProjectCompleteness += parseFloat(taskInst.getProperty('completeness'));
        if (isTrue(taskInst.getActive())) {
            pv += parseInt(taskInst.getProperty('bac')) * (parseInt(taskInst.getProperty('completeness')) / 100);
            ev += parseInt(taskInst.getProperty('bac')) * (getPlannifiedCompleteness(taskInst) / 100);
            ac += parseInt(taskInst.getProperty('wages')) + (parseInt(taskInst.getProperty('completeness')) / 100) * parseInt(taskInst.getProperty('fixedCosts')) + parseInt(taskInst.getProperty('unworkedHoursCosts'));
        }
    }

    //sum of all task's completeness
    projectCompleteness.getInstance(self).setValue(sumProjectCompleteness);

    //pv = for each task, sum -> bac * task completeness / 100
    planedValue.getInstance(self).setValue(pv);
    //ev = for each task, sum -> bac * planified task completeness / 100
    earnedValue.getInstance(self).setValue(ev);
    //ac = project fixe costs + for each task, sum -> wages + (completeness / 100) * fixed costs + unworkedHoursCosts
    actualCost.getInstance(self).setValue(ac + parseInt(projectFixCosts.getInstance(self).getValue()));

    updateGauges();

    costs.getInstance(self).saveHistory();
    delay.getInstance(self).saveHistory();
    quality.getInstance(self).saveHistory();
    planedValue.getInstance(self).saveHistory();
    earnedValue.getInstance(self).saveHistory();
    actualCost.getInstance(self).saveHistory();
}

/**
 * Set gauge value (and restrict them between their bounds (max and min values))
 */
function updateGauges() {
    var i, j, taskInst, tasks = VariableDescriptorFacade.findByName(gm, 'tasks'),
            costs = VariableDescriptorFacade.findByName(gm, 'costs'),
            delay = VariableDescriptorFacade.findByName(gm, 'delay'),
            quality = VariableDescriptorFacade.findByName(gm, 'quality'),
            planedValue = VariableDescriptorFacade.findByName(gm, 'planedValue'),
            earnedValue = VariableDescriptorFacade.findByName(gm, 'earnedValue'),
            actualCost = VariableDescriptorFacade.findByName(gm, 'actualCost'),
            tasksQuality = 0, nomberOfBeganTasks = 0, tasksScale = 0, nomberOfEmployeeRequired,
            costsJaugeValue, qualityJaugeValue, delayJaugeValue, qualityJaugeValue = 0;

    //Calculate task quality and task scale
    for (i = 0; i < tasks.items.size(); i++) {
        taskInst = tasks.items.get(i).getInstance(self);
        if (isTrue(taskInst.getActive())) {//if task is active
            if (parseInt(taskInst.getProperty('completeness')) > 0) { //...and started
                //tasksQuality += parseInt(taskInst.getProperty('quality'));
                nomberOfBeganTasks += 1;
                nomberOfEmployeeRequired = 0;
                for (j = 0; j < taskInst.getRequirements().size(); j++) {
                    nomberOfEmployeeRequired += parseInt(taskInst.getRequirements().get(j).getQuantity());
                }
                tasksScale += parseInt(taskInst.getDuration()) * nomberOfEmployeeRequired;
                tasksQuality = parseInt(taskInst.getProperty('quality')) * parseInt(taskInst.getDuration()) * nomberOfEmployeeRequired;
            }
        }
    }

    //costs = EV / AC * 100
    if (parseInt(planedValue.getInstance(self).getValue()) > 0) {
        costsJaugeValue = Math.round((parseInt(earnedValue.getInstance(self).getValue()) / parseInt(actualCost.getInstance(self).getValue())) * 100);
    }
    costsJaugeValue = (costsJaugeValue > parseInt(costs.getMinValue())) ? costsJaugeValue : parseInt(costs.getMinValue());
    costsJaugeValue = (costsJaugeValue < parseInt(costs.getMaxValue())) ? costsJaugeValue : parseInt(costs.getMaxValue());
    costs.getInstance(self).setValue(costsJaugeValue);

    //delay = EV / PV * 100
    delayJaugeValue = Math.round(parseInt((earnedValue.getInstance(self).getValue()) / parseInt(planedValue.getInstance(self).getValue())) * 100);
    delayJaugeValue = (delayJaugeValue > parseInt(delay.getMinValue())) ? delayJaugeValue : parseInt(delay.getMinValue());
    delayJaugeValue = (delayJaugeValue < parseInt(delay.getMaxValue())) ? delayJaugeValue : parseInt(delay.getMaxValue());
    delay.getInstance(self).setValue(delayJaugeValue);

    //quality
    //with weighting of task's scale = sum each task -> task quality / task scale
    if (tasksScale > 0) {
        qualityJaugeValue = (tasksQuality / tasksScale);
    }
    //whitout weighting of task's scale
//    if (nomberOfBeganTasks > 0) {
//        qualityJaugeValue = tasksQuality / nomberOfBeganTasks;
//    }
    qualityJaugeValue += parseInt(qualityImpacts.value) / 2;
    println(qualityJaugeValue);
    qualityJaugeValue = (qualityJaugeValue > parseInt(quality.getMinValue())) ? qualityJaugeValue : parseInt(quality.getMinValue());
    qualityJaugeValue = (qualityJaugeValue < parseInt(quality.getMaxValue())) ? qualityJaugeValue : parseInt(quality.getMaxValue());
    quality.getInstance(self).setValue(qualityJaugeValue);
}

/**
 * calculate how many percent is completed based on current period and planified
 *  length of the task.
 * @param {TaskInstance} taskInst
 * @returns {Number} number between 0 and 100 (both including)
 */
function getPlannifiedCompleteness(taskInst) {
    var i, planif = taskInst.getPlannification(), planifArray = [],
            time = getCurrentInGameTime(), pastPeriods = 0;
    for (i = 0; i < planif.size(); i++) { //transform list to array to use function ''indexOf''
        planifArray.push(parseInt(planif.get(i)));
    }
    for (i = 0; i <= time.period; i++) {
        if (planifArray.indexOf(i) > -1) {
            pastPeriods += 1;
        }
    }
    return (planifArray.length > 0) ? (pastPeriods / planifArray.length) * 100 : 0;
}

/**
 * return the delay based on the difference (in percent) between
 *  plannifiedcompleteness and real completeness (completeness / planifiedCompleteness * 100)
 * if given task isn't started then delay = completeness + 100
 * planified completeness is based on function ''getPlannifiedCompleteness''
 * @param {taskDescriptor} taskDesc
 * @returns {Number} delay between 0 and 100
 */
function getCurrentTaskDelay(taskDesc) {
    var planif, delay = 0, planif = taskDesc.getInstance(self).getPlannification(),
            completeness = parseInt(taskDesc.getInstance(self).getProperty('completeness')),
            planifiedCompleteness = getPlannifiedCompleteness(taskDesc.getInstance(self));
    if (completeness > 0 && planif.length > 0) {
        if (planifiedCompleteness <= 0) {
            delay = completeness + 100;
        }
        else {
            delay = completeness / planifiedCompleteness * 100;
        }
    }
    return delay;
}

/**
 * Call fonction to creat activities (createActivities) then get each
 *  activities (but only one per task's requirement). for each activities,
 *   Call the function to calculate the progression of each requirement
 *   (calculateProgressOfNeed).
 *   Then, calculate and set the quality and the completeness for each tasks
 *   Then, check the end of the project (function ''checkEnd'');
 * @param {Number} currentStep
 */
function calculTasksProgress(currentStep) {
    var i, work, activitiesAsNeeds, oneTaskPerActivity, allCurrentActivities,
            taskProgress, allCurrentActivities,
            requirementsByWork, taskInst;
    //create activities
    allCurrentActivities = createActivities(currentStep);
    //get one unique requirement by activities and calculate its progression
    activitiesAsNeeds = getActivitiesWithEmployeeOnDifferentNeeds(allCurrentActivities);
    for (i = 0; i < activitiesAsNeeds.length; i++) { //for each need
        calculateProgressOfNeed(activitiesAsNeeds[i], allCurrentActivities);
    }
    //get each modified task and calculate is new quality and completeness
    oneTaskPerActivity = getUniqueTasksInActivities(activitiesAsNeeds);
    for (i = 0; i < oneTaskPerActivity.length; i++) {
        taskProgress = 0;
        taskInst = oneTaskPerActivity[i].getTaskDescriptor().getInstance(self);
        requirementsByWork = getRequirementsByWork(taskInst.getRequirements());
        for (work in requirementsByWork) {
            taskProgress += requirementsByWork[work].completeness;
        }
        taskProgress = (taskProgress > 97) ? 100 : taskProgress; //>97 yes, don t frustrate the players please.
        taskInst.setProperty('completeness', Math.round(taskProgress));
        taskInst.setProperty('quality', calculateTaskQuality(oneTaskPerActivity[i].getTaskDescriptor()));
    }
    checkEnd(allCurrentActivities, currentStep);
}

/**
 * Sort an Array of activities to keep only one occurence of task Descriptor
 * in each activities. So in the returned list, two activities can't have the same task.
 * @param {Array of activities} activities
 * @returns {Array of activities}
 */
function getUniqueTasksInActivities(activities) {
    var i, j, oneTaskPerActivity = [], wasAdded;
    if (activities.length > 0) {
        oneTaskPerActivity.push(activities[0]);
    }
    for (i = 0; i < activities.length; i++) {
        wasAdded = false;
        for (j = 0; j < oneTaskPerActivity.length; j++) {
            if (oneTaskPerActivity[j].getTaskDescriptor() === activities[i].getTaskDescriptor()) {
                wasAdded = true;
                break;
            }
        }
        if (!wasAdded) {
            oneTaskPerActivity.push(activities[i]);
        }
    }
    return oneTaskPerActivity;
}

/**
 * Sort an Array of activities to keep only one occurence of requirement
 * in each activities. So in the returned list, two activities can't have the same requirement.
 * @param {Array of activities} activities
 * @returns {Array of activities}
 */
function getActivitiesWithEmployeeOnDifferentNeeds(activities) {
    var i, j, activitiesAsNeeds = [], wasAdded;
    if (activities.length > 0) {
        activitiesAsNeeds.push(activities[0]);
    }
    for (i = 1; i < activities.length; i++) { //for each need
        wasAdded = false;
        if (getActivitiesWithEmployeeOnSameNeed(activities, activities[i]).length > 1) {
            for (j = 1; j < activitiesAsNeeds.length; j++) {
                if (activities[i] === activitiesAsNeeds[j]) {
                    wasAdded = true;
                    break;
                }
            }
        }
        if (!wasAdded) {
            activitiesAsNeeds.push(activities[i]);
        }
    }
    return activitiesAsNeeds;
}

/**
 * Sort the given array to keep only activities with employee on the same requirement
 * @param {Array of activities} activities
 * @param {Activity} activity
 * @returns {Array of activities}
 */
function getActivitiesWithEmployeeOnSameNeed(activities, activity) {
    var i, employeeInst, selectedReq, sortedActivities = [], selectedReqI;
    employeeInst = activity.getResourceInstance();
    selectedReq = activity.getRequirement();
    for (i = 0; i < activities.length; i++) {
        if (parseFloat(activity.getTime()) === parseFloat(activities[i].getTime()) && activity.getTaskDescriptor() === activities[i].getTaskDescriptor()) {
            selectedReqI = activities[i].getRequirement();
            if (selectedReq === selectedReqI) {
                sortedActivities.push(activities[i]);
            }
        }
    }
    return sortedActivities;
}

/**
 * Create activities for each reserved (having an occupation at this time) employees having a valid assignement.
 * if a corresponding activity exist in the past, get it, else create activity
 *  and adjust its value.
 * @param {Number} currentStep
 * @returns {Array of Activities}
 */
function createActivities(currentStep) {
    var i, listEmployees = flattenList(VariableDescriptorFacade.findByName(gm, 'employees')),
            employeeDesc, employeeInst, activity, activities = [], assignables,
            existanteActivity, time = getCurrentInGameTime().period + currentStep / 10;
    if (!listEmployees) {
        return activities;
    }
    for (i = 0; i < listEmployees.length; i++) {
        employeeDesc = listEmployees[i];
        employeeInst = employeeDesc.getInstance(self);
        if (isReservedToWork(employeeInst)) { //have a 'player created' occupation
            assignables = checkAssignments(employeeInst.getAssignments(), currentStep);
            if (assignables.length > 0) { //have assignable tasks
                existanteActivity = findLastStepCorrespondingActivity(employeeInst, assignables[0].getTaskDescriptor(), time);
                if (existanteActivity) { //set corresponding past activity if it existe. Else create it.
                    activity = existanteActivity;
                } else {
                    activity = employeeInst.createActivity(assignables[0].getTaskDescriptor());
                }
                activity.setRequirement(selectRequirementFromActivity(activity));
                activity.setTime(time);
                activities.push(activity);
            }
        }
    }
    return activities;
}

/**
 * Check and return the most adapted requirement in the task of the activity,
 *  for the employee in the activity. Use function (''selectRequirement'') to
 *   choose the requirement.
 * @param {Activity} activity
 * @returns {WRequirement} the selected (most adapted) requierement
 */
function selectRequirementFromActivity(activity) {
    var selectedReq, workAs, taskInst, reqByWorks;
    taskInst = activity.getTaskDescriptor().getInstance(self);
    reqByWorks = getRequirementsByWork(taskInst.getRequirements());
    workAs = selectFirstUncompletedWork(taskInst.getRequirements(), reqByWorks);
    selectedReq = selectRequirement(taskInst, activity.getResourceInstance(), workAs, reqByWorks);
    return selectedReq;
}

/**
 * Research and return an activity having the same task, the same employee and
 *  worked on at the last step.
 * @param {ResourceInstance} employeeInst
 * @param {TaskDescriptor} taskDesc
 * @param {Number} currentPeriod
 * @returns {Activity} activity
 */
function findLastStepCorrespondingActivity(employeeInst, taskDesc, currentPeriod) {
    var i, activity, occurence = null;
    for (i = 0; i < employeeInst.getActivities().size(); i++) {
        activity = employeeInst.getActivities().get(i);
        if (activity.getTaskDescriptor() === taskDesc   //if the task of activity match with the given task (same task and same employee == same activity)
                && currentPeriod - Math.floor(currentPeriod) !== 0 //if it s not a new period (current step !== 0)
                && parseFloat(activity.getTime()) === getFloat(currentPeriod - 0.1)) { //if activity was used the last step
            occurence = activity;
            break;
        }
    }
    return occurence;
}

/**
 * Research and return an activity having the same task, the same employee and
 *  worked on in previous period or step.
 * @param {ResourceInstance} employeeInst
 * @param {TaskDescriptor} taskDesc
 * @param {Number} currentPeriod
 * @returns {Activity} activity
 */
function haveCorrespondingActivityInPast(employeeInst, taskDesc, currentPeriod) {
    var i, activity, occurence = false;
    for (i = 0; i < employeeInst.getActivities().size(); i++) {
        activity = employeeInst.getActivities().get(i);
        if (activity.getTaskDescriptor() === taskDesc   //if the task of activity match with the given task (same task and same employee == same activity)
                && currentPeriod > parseFloat(activity.getTime())) {
            occurence = true;
            break;
        }
    }
    return occurence;
}

/**
 * Check if the given resource have an occupation where time correspond to the current time.
 * If its true, the employee is reserved (and the function return true)
 * @param {RessourceInstance} employeeInst
 * @returns {Boolean} is reserved
 */
function isReservedToWork(employeeInst) {
    var i, occupations = employeeInst.getOccupations(),
            time = getCurrentInGameTime(), reservedToWork = false;
    for (i = 0; i < occupations.size(); i++) {
        if (parseInt(occupations.get(i).getTime()) === time.period && isTrue(occupations.get(i).getEditable())) {
            reservedToWork = true;
        }
    }
    return reservedToWork;
}


function getAssignables(assignments) {
    var i, taskDesc, assignables = [], work;
    for (i = 0; i < assignments.size(); i++) {
        work = null;
        taskDesc = assignments.get(i).getTaskDescriptor();
        if (parseInt(taskDesc.getInstance(self).getProperty('completeness')) < 100 && getPredecessorFactor(taskDesc) >= 0.2) { //if the task isn t terminated and average of predecessors advancement is upper than 20%
            assignables.push(assignments.get(i));
        }
    }
    return assignables;
}

function checkAssignments(assignments, currentStep) {
    var i, taskDesc, employeeInst, employeeName,
            employeeJob, taskInst, nextTasks;
    if (assignments.size() <= 0) {
        return [];
    }
    employeeInst = assignments.get(0).getResourceInstance();
    employeeName = employeeInst.getDescriptor().getLabel();
    employeeJob = employeeInst.getSkillsets().keySet().toArray()[0];
    nextTasks = getAssignables(employeeInst.getAssignments());
    for (i = 0; i < assignments.size(); i++) {
        taskDesc = assignments.get(i).getTaskDescriptor();
        taskInst = taskDesc.getInstance();
        if (parseFloat(taskInst.getProperty('completeness')) >= 100) {
            if (nextTasks[0]) {
                sendMessage(getStepName(currentStep) + ') Fin de la t�che : ' + taskDesc.getLabel(),
                        'La t�che ' + taskDesc.getLabel() + ' est termin�e, je passe � la t�che ' + nextTasks[0].getTaskDescriptor().getLabel() + ' <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
                        employeeName);
            } else {
                sendMessage(getStepName(currentStep) + ') Fin de la t�che : ' + taskDesc.getLabel(),
                        'La t�che ' + taskDesc.getLabel() + ' est termin�e, je retourne � mon activiti� traditionnelle. <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
                        employeeName);
            }
            assignments.remove(i);
            break;
        } else if (getPredecessorFactor(taskDesc) <= 0.2) {
            sendMessage(getStepName(currentStep) + ') Impossible de progresser sur la t�che : ' + taskDesc.getLabel(),
                    'Je suis sens� travailler sur la t�che ' + taskDesc.getLabel() + ' mais les t�ches pr�cedentes ne sont pas assez avanc�es. <br/> Je retourne donc � mes occupations habituel. <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
                    employeeName);
            assignments.remove(i);
            break;
        }
    }
    return nextTasks;
}

function getPredecessorFactor(taskDesc) {
    var i, predecessorsAdvancements, predecessors, average, numberOfPredecessors;
    predecessorsAdvancements = 0;
    numberOfPredecessors = 0;
    predecessors = taskDesc.getPredecessors();
    for (i = 0; i < predecessors.size(); i++) {
        if (isTrue(predecessors.get(i).getInstance(self).getActive())) {
            predecessorsAdvancements += parseInt(predecessors.get(i).getInstance(self).getProperty('completeness'));
            numberOfPredecessors += 1;
        }
    }
    if (numberOfPredecessors > 0) {
        average = predecessorsAdvancements / numberOfPredecessors;
    } else {
        average = 100;
    }
    return Math.pow(average / 100, parseInt(taskDesc.getInstance(self).getProperty('predecessorsDependances')));
}

function selectFirstUncompletedWork(requirements, reqByWorks) {
    var work, firstUncompletedWork;
    if (!reqByWorks) {
        reqByWorks = getRequirementsByWork(requirements); // get requirements merged by kind of work.
    }
    for (work in reqByWorks) {
        if (reqByWorks[work].completeness < reqByWorks[work].maxLimit) { //check if the maximum limite from all requirements of the current kind of work is smaller than the completeness of the current kind of work
            firstUncompletedWork = work;
            break;
        }
    }
    return firstUncompletedWork;
}

function selectRequirement(taskInst, employeeInst, workAs, reqByWorks) {
    var i, requirements = taskInst.getRequirements(), req, selectedReq = null,
            totalOfPersonneInTask = 0, deltaLevel = 1000,
            level = parseInt(employeeInst.getSkillsets().get(employeeInst.getSkillsets().keySet().toArray()[0]));
    for (i = 0; i < requirements.size(); i++) {
        totalOfPersonneInTask += parseInt(requirements.get(i).getQuantity());
    }
    for (i = 0; i < requirements.size(); i++) {
        req = requirements.get(i);
        if (req.getWork() == workAs && parseFloat(req.getCompleteness()) < (reqByWorks[workAs].maxLimit * totalOfPersonneInTask / reqByWorks[workAs].totalOfEmployees)) {
            if (Math.abs(deltaLevel) > level - parseInt(req.getLevel())) {
                deltaLevel = level - parseInt(req.getLevel());
                selectedReq = req;
            }
        }
    }
    return selectedReq;
}

function getRequirementsByWork(requirements) {
    var i, req, works = {}, work, needsCompletion = 0, totalOfEmployees = 0;
    for (i = 0; i < requirements.size(); i++) {
        req = requirements.get(i);
        //keep an occurance of each kind of work needed
        if (works[req.getWork()]) {
            work = works[req.getWork()];
        } else {
            work = works[req.getWork()] = {
                maxLimit: 0,
                typesOfLevels: [],
                totalOfEmployees: 0,
                completeness: 0
            };
        }
        //keep the highest limit of all limits from each kind of work needed
        if (work.maxLimit < parseInt(req.getLimit())) {
            work.maxLimit = parseInt(req.getLimit());
        }
        //keep all kind of levels for each kind of work needed
        if (work.typesOfLevels.indexOf(req.getLevel()) <= -1) {
            work.typesOfLevels.push(req.getLevel());
        }
        //keep the summe of personns needed for each kind of work needed
        totalOfEmployees += parseInt(req.getQuantity());
        //is needed for next calcul
        needsCompletion += (parseFloat(req.getCompleteness()) * parseInt(req.getQuantity()));
    }
    for (work in works) {
        //keep the summe of personns needed for each kind of work needed
        works[work].totalOfEmployees = totalOfEmployees;
        //keep the work completion for each kind of work needed
        works[work].completeness = (needsCompletion / totalOfEmployees);
    }
    return works;
}

function calculateProgressOfNeed(activityAsNeeds, allCurrentActivities) {
    var i, taskDesc, taskInst, employeeDesc, employeeInst, activityRate, sameNeedActivity,
            affectedEmployeesDesc = [], requirements, stepAdvance = 1, sumActivityRate = 0,
            employeesMotivationXActivityRate = 0, deltaLevel, workAs, selectedReq,
            employeesMotivationFactor, employeesSkillsetXActivityRate = 0,
            employeeSkillsetFactor, activityCoefficientXActivityRate = 0, otherWorkFactor = 1,
            correctedRessources, reqByWorks, numberOfEmployeeOnNeedOnNewTask = 0,
            needProgress, motivationXActivityRate = 0, skillsetXActivityRate = 0, level,
            averageSkillsetQuality, stepQuality = 0;

    taskDesc = activityAsNeeds.getTaskDescriptor();
    taskInst = taskDesc.getInstance(self);
    requirements = taskInst.getRequirements();
    reqByWorks = getRequirementsByWork(requirements);
    selectedReq = activityAsNeeds.getRequirement();
    workAs = selectedReq.getWork();
    sameNeedActivity = getActivitiesWithEmployeeOnSameNeed(allCurrentActivities, activityAsNeeds);
    level = parseInt(activityAsNeeds.getResourceInstance().getSkillsets().get(activityAsNeeds.getResourceInstance().getSkillsets().keySet().toArray()[0]));
    deltaLevel = parseInt(selectedReq.getLevel()) - level;

    //For each need
    for (i = 0; i < sameNeedActivity.length; i++) {
        employeeInst = sameNeedActivity[i].getResourceInstance();
        employeeDesc = employeeInst.getDescriptor();
        affectedEmployeesDesc.push(employeeDesc);
        activityRate = parseFloat(employeeDesc.getInstance(self).getProperty('activityRate'));
        sumActivityRate += activityRate;
        //Calculate ressource motivation factor
        employeesMotivationFactor = 1 + 0.05 * parseFloat(employeeDesc.getProperty('coef_moral')) * (parseInt(employeeDesc.getInstance(self).getMoral()) - 7);
        //Calcul variables for needMotivationFactor
        employeesMotivationXActivityRate += employeesMotivationFactor * activityRate;
        //Calcul variables for needSkillsetFactor
        if (deltaLevel > 0) {
            employeeSkillsetFactor = 1 + 0.05 * parseFloat(taskDesc.getProperty('competenceRatioSup')) * deltaLevel;
            if (employeeSkillsetFactor < 0) {
                employeeSkillsetFactor = 0;
            }
        } else {
            employeeSkillsetFactor = 1 + 0.05 * parseFloat(taskDesc.getProperty('competenceRatioInf')) * deltaLevel;
        }
        employeesSkillsetXActivityRate += employeeSkillsetFactor * activityRate;
        //Calcul variable for needSkillsetFactor
        activityCoefficientXActivityRate += parseFloat(employeeDesc.getProperty('coef_activity')) * activityRate;
        //Calcul variable for learnFactor
        if (!haveCorrespondingActivityInPast(employeeInst, taskDesc, getCurrentInGameTime().period)) {
            numberOfEmployeeOnNeedOnNewTask++;
        }
        //Calculate variable for quality
        motivationXActivityRate += parseInt(employeeInst.getMoral()) * activityRate;
        skillsetXActivityRate += parseInt(employeeInst.getSkillsets().get(employeeInst.getSkillsets().keySet().toArray()[0])) * activityRate; //level * activityRate
    }

    //calculate needMotivationFactor, needSkillsetFactor and activityNeedRateFactor
    if (sumActivityRate !== 0) {
        stepAdvance *= employeesMotivationXActivityRate / sumActivityRate; //needMotivationFactor
        stepAdvance *= employeesMotivationXActivityRate / sumActivityRate; //needSkillsetFactor
        stepAdvance *= activityCoefficientXActivityRate / sumActivityRate; //activityNeedRateFactor
    }

    // calculate baseAdvance
    stepAdvance *= 1 / (steps * (parseInt(taskDesc.getInstance(self).getDuration()))); //baseAdvance

    // calculate numberOfRessourcesFactor
    if (reqByWorks[workAs].totalOfEmployees !== 0) {
        if (affectedEmployeesDesc.length <= reqByWorks[workAs].totalOfEmployees) {
            correctedRessources = reqByWorks[workAs].totalOfEmployees + parseFloat(taskDesc.getProperty('coordinationRatioInf')) * (affectedEmployeesDesc.length - reqByWorks[workAs].totalOfEmployees);
            if (correctedRessources / affectedEmployeesDesc.length < 0.2) {
                correctedRessources = affectedEmployeesDesc.length / 5;
            }
        } else {
            correctedRessources = reqByWorks[workAs].totalOfEmployees + parseFloat(taskDesc.getProperty('coordinationRatioSup')) * (affectedEmployeesDesc.length - reqByWorks[workAs].totalOfEmployees);
        }
        stepAdvance *= correctedRessources / reqByWorks[workAs].totalOfEmployees; //numberOfRessourcesFactor
    }

    //calculate otherWorkFactor
    if (activityAsNeeds.getResourceInstance().getSkillsets().keySet().toArray()[0] != workAs) {
        otherWorkFactor = 0.8;
    }
    stepAdvance *= otherWorkFactor;

    //calculate randomFactor
    stepAdvance *= getRandomFactorFromTask(taskInst);

    //calculate learnFactor
    if (parseInt(taskInst.getProperty('completeness')) > 15) {
        stepAdvance *= 1 - ((numberOfEmployeeOnNeedOnNewTask * (parseFloat(taskInst.getProperty('takeInHandDuration') / 100))) / affectedEmployeesDesc.length);//learnFactor
    }

    //calculate tasks bonusRatio
    stepAdvance *= (parseFloat(taskInst.getProperty('bonusRatio')));

    //calculate project bonusRatio
    stepAdvance *= parseFloat(VariableDescriptorFacade.findByName(gm, 'bonusRatio').getInstance(self).getValue());

    //calculate predecessorFactor
    stepAdvance *= getPredecessorFactor(taskDesc); //predecessor factor

    stepAdvance *= 100;

    //calculate new needCompleteness
    needProgress = parseFloat(selectedReq.getCompleteness()) + stepAdvance;
    //calculate stepQuality
    if (sumActivityRate !== 0) {
        stepQuality = 1 + 0.03 * ((motivationXActivityRate / sumActivityRate) - 7); //Motivation quality
        averageSkillsetQuality = (skillsetXActivityRate / sumActivityRate);
        if (averageSkillsetQuality >= parseInt(selectedReq.getLevel())) {
            stepQuality += 1 + 0.02 * (averageSkillsetQuality - parseInt(selectedReq.getLevel())); //skillset (level) quality
        } else {
            stepQuality += 1 + 0.03 * (averageSkillsetQuality - parseInt(selectedReq.getLevel())); //skillset (level) quality
        }
    }
    stepQuality = (stepQuality / 2) * 100; //step Quality
    if (needProgress > 0) {
        selectedReq.setQuality((parseFloat(selectedReq.getQuality()) * parseFloat(selectedReq.getCompleteness()) + stepQuality * stepAdvance) / needProgress);
    }

    //set Wage (add 1/steps of the need's wage at task);
    taskInst.setProperty('wages', (parseInt(taskInst.getProperty('wages')) + (parseInt(activityAsNeeds.getResourceInstance().getProperty('wage')) / steps)));

    if (testMode) {
        println('sameNeedActivity.length : ' + sameNeedActivity.length);
        println('employeesMotivationFactor : ' + employeesMotivationFactor);
        println('employeesMotivationXActivityRate : ' + employeesMotivationXActivityRate);
        println('sumActivityRate : ' + sumActivityRate);
        println('deltaLevel : ' + deltaLevel);
        println('employeeSkillsetFactor : ' + employeeSkillsetFactor);
        println('employeesSkillsetXActivityRate : ' + employeesSkillsetXActivityRate);
        println('activityCoefficientXActivityRate : ' + activityCoefficientXActivityRate);
        println('numberOfEmployeeOnNeedOnNewTask : ' + numberOfEmployeeOnNeedOnNewTask);
        println('motivationXActivityRate: ' + motivationXActivityRate);
        println('skillsetXActivityRate: ' + skillsetXActivityRate);
        println('NeedMotivationFactor : ' + employeesMotivationXActivityRate / sumActivityRate);
        println('NeedSkillsetFactor : ' + employeesMotivationXActivityRate / sumActivityRate);
        println('ActivityNeedRateFactor : ' + activityCoefficientXActivityRate / sumActivityRate);
        println('baseAdvance : ' + 1 / (steps * (parseInt(taskDesc.getInstance(self).getDuration()))));
        println('numberOfRessourcesFactor : ' + correctedRessources / reqByWorks[workAs].totalOfEmployees);
        println('otherWorkFactor : ' + otherWorkFactor);
        println('randomFactor (not same value as used !) : ' + getRandomFactorFromTask(taskInst));
        println('learnFactor : ' + (1 - ((numberOfEmployeeOnNeedOnNewTask * (parseFloat(taskInst.getProperty('takeInHandDuration') / 100))) / affectedEmployeesDesc.length)));
        println('bonusRatio : ' + parseFloat(taskInst.getProperty('bonusRatio')));
        println('predecessorFactor : ' + getPredecessorFactor(taskDesc)); //predecessor factor);
        println('wages : ' + (parseInt(taskInst.getProperty('wages')) + (parseInt(activityAsNeeds.getResourceInstance().getProperty('wage')) / steps))); //predecessor factor);
        println('stepAdvance : ' + stepAdvance);
        println('need completeness : ' + parseFloat(selectedReq.getCompleteness()));
        println('needProgress : ' + needProgress);
        println('StepQuality : ' + (parseFloat(selectedReq.getQuality()) * parseFloat(selectedReq.getCompleteness()) + stepQuality * stepAdvance) / needProgress);
    }

    //set need progress (after calcuateQuality) and return it
    selectedReq.setCompleteness(needProgress);
    return  needProgress;
}

function getRandomFactorFromTask(taskInst) {
    var rn = Math.floor(Math.random() * 100), //number 0 to 100 (0 inclusive, 100 exclusive);
            randomDurationSup = parseFloat(taskInst.getProperty('randomDurationSup')),
            randomDurationInf = parseFloat(taskInst.getProperty('randomDurationInf')),
            duration = parseInt(taskInst.getInstance(self).getDuration()), delta,
            randomFactor, x = Math.random();

    switch (rn) {
        case (rn < 3) :
            delta = -(0.25 * x + 0.75) * randomDurationInf;
            break;
        case (rn < 10) :
            delta = -(0.25 * x + 0.50) * randomDurationInf;
            break;
        case (rn < 25) :
            delta = -(0.25 * x + 0.25) * randomDurationInf;
            break;
        case (rn < 50) :
            delta = -0.25 * x * randomDurationInf;
            break;
        case (rn < 75) :
            delta = 0.25 * x * randomDurationSup;
            break;
        case (rn < 90) :
            delta = (0.25 * x + 0.25) * randomDurationSup;
            break;
        case (rn < 97) :
            delta = (0.25 * x + 0.50) * randomDurationSup;
            break;
        default :
            delta = (0.25 * x + 0.75) * randomDurationSup;
            break;
    }

    randomFactor = duration + delta;

    if (randomFactor < minTaskDuration) {
        randomFactor = minTaskDuration;
    }

    return getFloat((duration / randomFactor), 2);
}

function calculateTaskQuality(taskDesc) {
    var i, req, needQualityXNeedProgress = 0, needProgress = 0;
    for (i = 0; i < taskDesc.getInstance(self).getRequirements().size(); i++) {
        req = taskDesc.getInstance(self).getRequirements().get(i);
        needQualityXNeedProgress += (parseFloat(req.getQuality()) * parseFloat(req.getCompleteness()));
        needProgress += parseFloat(req.getCompleteness());
    }
    return Math.round((needQualityXNeedProgress / needProgress));
}


function tempInit() {
    var occupation, listEmployees = flattenList(VariableDescriptorFacade.findByName(gm, 'employees')),
            listTasks = VariableDescriptorFacade.findByName(gm, 'tasks');

    occupation = listEmployees[0].getInstance(self).addOccupation();
    occupation.setTime(1.0);
    occupation = listEmployees[0].getInstance(self).addOccupation();
    occupation.setTime(2.0);
    occupation = listEmployees[1].getInstance(self).addOccupation();
    occupation.setTime(1.0);
    occupation = listEmployees[2].getInstance(self).addOccupation();
    occupation.setTime(2.0);
    occupation = listEmployees[2].getInstance(self).addOccupation();
    occupation.setTime(3.0);
    occupation.setEditable(false);

    //listTasks.items.get(0).getPredecessors().add(listTasks.items.get(1));

    listEmployees[1].getInstance(self).assign(listTasks.items.get(0));
    listEmployees[0].getInstance(self).assign(listTasks.items.get(1));

    return 'is initialized';
}

function getCurrentInGameTime() {
    var inGameTime = {phase: null, period: null},
    phases = VariableDescriptorFacade.findByName(gm, 'currentPeriod');
    inGameTime.phase = parseInt(currentPhase.value);
    if (phases !== null && inGameTime.phase !== null) {
        inGameTime.period = parseInt(phases.items.get(inGameTime.phase).getInstance(self).value);
    }
    return inGameTime;
}

function isTrue(arg) {
    return (arg == true || arg == 'true') ? true : false;
}

function getFloat(number, numberOfDigit) {
    numberOfDigit = Math.pow(10, (numberOfDigit > 1) ? numberOfDigit : 1);
    return Math.round(number * numberOfDigit) / numberOfDigit;
}

function flattenList(list, finalList) {
    var i, el;
    finalList = (finalList) ? finalList : [];
    for (i = 0; i < list.items.size(); i++) {
        el = list.items.get(i);
        if (el.getClass() && el.getClass().toString() == 'class com.wegas.core.persistence.variable.ListDescriptor') {
            finalList = this.flattenList(el, finalList);
        } else {
            finalList.push(el);
        }
    }
    return finalList;
}
function checkEnd(allCurrentActivities, currentStep) {
    var i, employeeInst, taskInst, taskDesc, employeeName, employeeJob,
            nextWork, reqByWorks;
    for (i = 0; i < allCurrentActivities.length; i++) {
        taskDesc = allCurrentActivities[i].getTaskDescriptor();
        taskInst = taskDesc.getInstance(self);
        employeeInst = allCurrentActivities[i].getResourceInstance();
        employeeName = employeeInst.getDescriptor().getLabel();
        employeeJob = employeeInst.getSkillsets().keySet().toArray()[0];
        if (currentStep === steps - 1) {
            checkAssignments(employeeInst.getAssignments(), currentStep);
        } else if (parseFloat(taskInst.getProperty('completeness')) < 100) {
            reqByWorks = getRequirementsByWork(taskInst.getRequirements());
            nextWork = selectFirstUncompletedWork(taskInst.getRequirements(), reqByWorks);
            if (allCurrentActivities[i].getRequirement().getWork() != nextWork) {
                sendMessage(getStepName(currentStep) + ') T�che : ' + taskDesc.getLabel() + ' en partie termin�e',
                        'Nous avons termin� la partie ' + allCurrentActivities[i].getRequirement().getWork() + ' de la t�che ' + taskDesc.getLabel() + '. Je passe � ' + nextWork + '. <br/> Salutations <br/>' + employeeName + '<br/> ' + employeeJob,
                        employeeName);
            }
        }

    }
}

/**
 * Return a name for each step.
 * @param {Number} step
 * @returns {String} the name of the step
 */
function getStepName(step) {
    var name;
    switch (step) {
        case 0 :
            name = 'Lundi matin';
            break;
        case 1 :
            name = 'Lundi apr�s-midi';
            break;
        case 2 :
            name = 'Mardi matin';
            break;
        case 3 :
            name = 'Mardi apr�s-midi';
            break;
        case 4 :
            name = 'Mercredi matin';
            break;
        case 5 :
            name = 'Mercredi apr�s-midi';
            break;
        case 6 :
            name = 'Jeudi matin';
            break;
        case 7 :
            name = 'Jeudi apr�s-midi';
            break;
        case 8 :
            name = 'Vendredi matin';
            break;
        case 9 :
            name = 'Vendredi apr�s-midi';
            break;
        default :
            name = 'samedi matin';
    }
    return name;
}

/**
 * get the specified wegas bean.
 * @param String name, the name of the bean
 * @return the wanted bean or null
 */
function lookupBean(name) {
    var ctx = new InitialContext();
    return ctx.lookup('java:module/' + name);
}

/**
 * Send a message to the current player.
 * @param String subject, the subject of the message.
 * @param String message, the content of the message.
 * @param String from, the sender of the message.
 */
function sendMessage(subject, content, from) {
    var EF = lookupBean('MessageFacade');
    if (EF) {
        EF.send(self, subject, content, from);
    }
    else {
        println('Bean InGameMailFacade does not exist, unable to send in-game message: ' + subject);
    }
}

// Functions for addArtosPredecessor
function addArtosPredecessor() {
    var listPredName = [];
    // ChoixEnvironnementD�veloppement predecessor
    listPredName.push('ChoixEnvironnementD�veloppement', 'AnalyseExistant', 'AnalyseBesoins');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'DossierSp�cifications').getName(), listPredName);

    // Mod�lisationDonn�es predecessor
    listPredName = [];
    listPredName.push('DossierSp�cifications', 'PrototypeUtilisateur');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'Mod�lisationDonn�es').getName(), listPredName);

    // Mod�lisationTraitements predecessor
    listPredName = [];
    listPredName.push('DossierSp�cifications', 'PrototypeUtilisateur');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'Mod�lisationTraitements').getName(), listPredName);

    // Mod�lisationIHM predecessor
    listPredName = [];
    listPredName.push('DossierSp�cifications', 'PrototypeUtilisateur');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'Mod�lisationIHM').getName(), listPredName);

    // ProgrammationBD predecessor
    listPredName = [];
    listPredName.push('Mod�lisationDonn�es');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'ProgrammationBD').getName(), listPredName);

    // ProgrammationTraitements predecessor
    listPredName = [];
    listPredName.push('Mod�lisationDonn�es', 'Mod�lisationTraitements');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'ProgrammationTraitements').getName(), listPredName);

    // ProgrammationIHM predecessor
    listPredName = [];
    listPredName.push('Mod�lisationIHM');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'ProgrammationIHM').getName(), listPredName);

    // PromotionSyst�me predecessor
    listPredName = [];
    listPredName.push('DossierSp�cifications');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'PromotionSyst�me').getName(), listPredName);

    // Tests predecessor
    listPredName = [];
    listPredName.push('ProgrammationBD', 'ProgrammationTraitements', 'ProgrammationIHM', 'CorrectionMod�lisationTraitements', 'CorrectionProgrammationTraitements');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'Tests').getName(), listPredName);

    // ImplantationMachine predecessor
    listPredName = [];
    listPredName.push('ProgrammationBD', 'ProgrammationTraitements', 'ProgrammationIHM');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'ImplantationMachine').getName(), listPredName);

    // PrototypeUtilisateur predecessor
    listPredName = [];
    listPredName.push('ChoixEnvironnementD�veloppement', 'AnalyseExistant', 'AnalyseBesoins');
    addPredecessor(VariableDescriptorFacade.findByName(gm, 'PrototypeUtilisateur').getName(), listPredName);
}

// Function for add taskPredecessor
function addPredecessor(descName, listPredName) {
    var i, ii, iii, taskDescList = VariableDescriptorFacade.findByName(gm, 'tasks'),
            taskDesc;

    for (i = 0; i < taskDescList.items.size(); i++) {
        taskDesc = taskDescList.items.get(i);
        if (taskDesc.getName() == descName) {
            for (ii = 0; ii < listPredName.length; ii++) {
                for (iii = 0; iii < taskDescList.items.size(); iii++) {
                    if (listPredName[ii] == taskDescList.items.get(iii).getName()) {
                        taskDesc.getPredecessors().add(taskDescList.items.get(iii));
                        break;
                    }
                }
            }
            break;
        }
    }
}


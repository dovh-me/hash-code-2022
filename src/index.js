const { writeFile, readFile } = require('./utils/files');

function execute (filePath) {
    // read the input data
    const data = readFile(filePath);
    const processedData = processData(data);
    let projects = processedData.projects;
    let contributors = processedData.contributors;
    // sort projects by score
    projects = projects.sort((prev, current) => {
        return current.score - prev.score;
    });
    

    const allocated = allocateProjects(projects, contributors);
    const outputString = createOutput(allocated);
    console.log(outputString);

    // write the output to a file
    const outputFileName = filePath.split('/').pop().replace('in','out');
    writeFile(`./outputs/${outputFileName}`,outputString);
}

function processData (data = '') {
    data = data.trim();
    // split data by /n
    const splitByNewLine = data.split('\n');
    // get the contributor count
    const tempCounts = splitByNewLine.splice(0,1)[0].split(' ');
    const contributorCount = +tempCounts[0];
    const projectCount = +tempCounts[1];

    const contributors = new Array();
    for (let i = 0; i < contributorCount; i++) {
        const temp = splitByNewLine.splice(0,1)[0].split(' ');
        const contributorName = temp[0];
        const skillCount = +temp[1];
        const skills = splitByNewLine.splice(0,skillCount);
        const contributor = {
            name: contributorName,
            skills: []
        }
        skills.forEach((skill) => { 
            const _temp = skill.split(' ');
            contributor.skills.push({skill: _temp[0], level: +_temp[1] });
        });
        contributors.push(contributor);
    }

    const projects = new Array();
    for (let i = 0; i < projectCount; i++) {
        const temp = splitByNewLine.splice(0,1)[0].split(' ');
        const projectName = temp[0];
        const project = {
            name: projectName,
            roles: []
        }
        project.duration = +temp[1];
        project.score = +temp[2];
        project.deadLine = +temp[3];
        const roleCount = +temp[4];
        const roles = splitByNewLine.splice(0,roleCount);

        roles.forEach((skill) => { 
            const _temp = skill.split(' ');
            project.roles.push({role: _temp[0], level: +_temp[1] });
        });
        projects.push(project);
    }

    return { contributors, projects };
}


function allocateProjects(projects, contributors) {
    const allocatedProjects = [];
    const busyContributors = [];
    // iterate over each project to find suitable candidates for the project
    projects.forEach((project) => {
        // ordered in the order of the roles
        const projectCandidates = [];
        // iterate over each project to find suitable candidates for a role
        project.roles.forEach((role) => {
            let candidates = [];

            contributors.forEach((contributor) => {
                // ignore the contributor if already in the project
                if (projectCandidates.includes(contributor)) return;
                // ignore the contributor if busy before the deadline - can be optimized
                if (busyContributors.find(e => e.name === contributor.name && e.busyTill > project.deadLine)) return;

                const skill = contributor.skills.find((e) => (e.skill === role.role) && (e.level >= role.level));
                if (skill) {
                    // console.log(`candidate found for role ${role} of project ${project}: Contributor - ${contributor.name}`);
                    candidates.push(contributor);
                }
            });
            // skip project if candidate not found
            if (!candidates.length) return;
            // for now get the first candidate
            const chosenCandidate = candidates[0]
            projectCandidates.push(chosenCandidate);
            busyContributors.push({ name: chosenCandidate.name, busyTill: project.duration });
            candidates = [];
        });
        // don't add the project if no contributors are found for a role
        if (projectCandidates.length < project.roles.length) return;
        allocatedProjects.push({ name: project.name, contributors: projectCandidates.map(e => e.name) });
    });
    return allocatedProjects;
}

function createOutput(array = []) {
    let output = `${array.length}\n`;
    array.forEach((e) => {
        output += `${e.name}\n${e.contributors.join(' ')}\n`
    });

    return output;
}

execute('./inputs/c_collaboration.in.txt');
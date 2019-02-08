module.exports = {
    Tasks: {
        Task: require("./Tasks/Task"),
        TasksManager: require("./Tasks/TasksManager")
    },
    Mutations: {
        Mutation: require("./Mutations/Mutation"),
        MutationsManager: require("./Mutations/MutationsManager"),
        MutationEvent: require("./Mutations/MutationEvent")
    },
    UIElements: {
        ProgressBar: require("./UIElements/ProgressBar")
    },
    css: ["Common"]
};

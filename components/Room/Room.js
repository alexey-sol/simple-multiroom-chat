import {
    Button,
    Container,
    Input
} from "element-ui";

import { mapMutations, mapState } from "vuex";

export default {
    components: {
        Button,
        Container,
        Input
    },

    computed: mapState([
        "currentRoom",
        "currentUser",
        "messages",
        "users"
    ]),

    mounted () {
        const { listener } = this.sockets;
        const { id } = this.$route.params;

        const shouldHaltVisitor = !this.currentUser.id;

        if (shouldHaltVisitor) {
            this.$message.error("Please sign in");
            return this.$router.push({
                path: "/"
            });
        }

        this.$socket.emit("join", this.currentUser, (error, roomData) => {
            if (error) {
                return this.$message.error(error.message);
            }

            const { room, messages, users } = roomData;

            this.setCurrentRoom(room);
            this.setMessages(messages);
            this.setUsers(users);
        });

        listener.subscribe("userJoined", (user) => {
            this.addUser(user);
        });

        listener.subscribe("userLeft", (id) => {
            this.removeUser(id);
        });

        listener.subscribe("message", (message) => {
            this.addMessage(message);
        });
    },

    data () {
        return {
            message: ""
        };
    },

    // dataAsync () {
    // },

    methods: {
        ...mapMutations([
            "addMessage",
            "addUser",
            "removeUser",
            "setCurrentRoom",
            "setMessages",
            "setUsers"
        ]),

        leaveChat () {
            this.$socket.emit("leave", () => {
                this.$router.push({
                    path: "/"
                });
            });
        },

        sendMessage () {
            const { currentUser, message } = this;

            this.$socket.emit("message", {
                authorName: currentUser.name,
                roomId: currentUser.roomId,
                text: message
            });
        }
    }
};

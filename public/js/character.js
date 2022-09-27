
class Character {
    constructor(id, name, color,status,skill_1,skill_2){
        this.id = id;
        this.name = name;
        this.color = color;
        this.status= status; //0 = survive, 1 = died
        this.skill_1 = skill_1;
        this.skill_2 = skill_2;
        this.player = null;
        this.target = null;
    }


}


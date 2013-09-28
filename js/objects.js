//some enum types about cards
card_type = {
	WEAPON: 0,
	SPELL: 1,
	CREATURE: 2
}

card_ability = {
	Battlecry: 17,Charge: 22,Combo: 20,Deathrattle: 25,Divine_Shield: 23,Enrage: 24,Freeze: 15,Grant_Charge: 21,Overload_X: 28,Spell_Power: 18,Secret: 26,Silence: 27,Stealth: 19,Summoned: 31,Taunt: 13,Transform: 14,Windfury: 16
}
//class card : meta data about the card
function Card (id,name,durability,type,tot_life,tot_mana,tot_attack,image,ability)
{
	this.id=id;
	this.name=name;
	this.durability=durability;
	this.type=type;
	this.tot_life=tot_life;
	this.tot_mana=tot_mana;
	this.tot_attack=tot_attack;
	this.cur_attack=tot_attack;
	this.cur_life=tot_life;
	this.cur_mana=tot_mana;
	this.image=image;
	this.ability=ability;
}
//Some function about the deck, shuffle, ...
function Deck(cards){
	this.cards = cards;
	Deck.prototype.shuffle = function(){
		//shuffle the cards
	};
	Deck.prototype.draw = function(){
		if(this.cards.length==0)
			return null;
		return this.cards.shift();
	};
}

//random test
var deck = new Deck([
		new Card (318,"Baine Bloodhoof",0,card_type.CREATURE,5,4,4,"img/EX1_110t.png",[]),
		new Card (440,"Abomination",0,card_type.CREATURE,4,5,4,"img/EX1_097.png",[]),
	]);
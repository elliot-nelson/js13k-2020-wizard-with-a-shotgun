# js13k-2020-wizard-with-a-shotgun

> My 2020 entry for the js13kgames competition, WIZARD WITH A SHOTGUN.

## INSTRUCTIONS

In this top-down 2D shooter, help the Wizard recover the missing pages of the Shotgun Arcana by blasting everything in this dungeon you see.

Play on desktop using any browser. Controls: mouse & keyboard.

NOTE: Firefox may experience some slowdowns.

## THE MAKING OF

### Influences/References

_NOTE: May contain spoilers if you haven't finished the game!_

- The main character is intended to be sort of a wise-cracking, street-smart wizard - think Harry Dresden, not Harry Potter. (Dresden carries a staff, not a shotgun, and doesn't wear purple wizard robes, but it's the attitude that counts.) Unfortunately, I discovered that dialog is VERY expensive in the final zip file, so I had to cut a lot of my planned lines.

- The game opens with a reference to Lovecraft (Shoggoths show up in the first episode of Lovecraft Country on HBO - I'm biased because I work there, but check it out if you love anything horror-related!)

- The game's ending is an homage to the ending of Episode 1 of the original DOOM (the final teleport into an endless stream of enemies and the opening paragraph). If I'd had a little more space, I was going to play the opening notes to E1M8 _Sign of Evil_ to make the reference even stronger... maybe in an updated version!

- A few seconds after the final teleport your page count (404) turns red and reads 666. Of course this number shows up lots of places but I had in mind the red 666 from the second-most-famous id game Quake, where your health would read 666 after picking up an Invulnerability glyph.

- The biggest influence on gameplay is Hotline Miami - I was going for the same kind of hectic top-down shooter feel, although bite-size since I had limited space for enemies, level design, etc.

- I didn't want dying to be hard stop in this game, so I adopted the Minecraft approach of just dropping all your "stuff" where you died. You could potentially be carrying hundreds of pages, so to avoid lagging the game horribly, the game renders it as up to 7 floating pages, but each one will be worth roughly 1/7 of the pages you were carrying. (Similar to Minecraft's stacks, although I didn't have the space for logic to render them that way.)

### Technical challenges

The biggest challenge this year, by far, was space... if I broke down the total hours spent developing this game, I think it would come out to about:

 - 40% coding the game's engine/features
 - 10% making pixel art
 - 10% messing with music and sound effects
 - 40% making everything above smaller

Some of the tricks I used extensively to get the game down to 13K include:

 - Cutting up sprites into pieces so I can reuse them. You can see my spritesheet [here](dist/final/sprites.png), notice how the player is cut up so I can do the idle head-bobbing and the shotgun recoil animations without having any duplicate pixels.

 - Knowing when _not_ to cut up sprites! _Test, test, test._ The Stabguts sprites, for example, are duplicated in full because it was cheaper to lay them all out than it was to add a couple extra `drawImage` calls. It's difficult to predict how the final ZIP compression will fall, so you just need to tackle possible improvements one at a time, and take the changes the help and jettison the ones that don't. (Another great example was the healthbar... it's size and shape SEEM to make it a perfect candidate for tiling, but after several tries, I concluded that I could not improve upon the PNG's already very good compression of solid lines.)

 - I started out the competition by writing a (pretty cool!) map generator, with the idea that I'd generate the map you explore each time you play. Eventually I came to the conclusion that for this bite-size game, the map just isn't that important - there aren't really any interesting features or items or objects to see, and every room is the same as any other room, so I cut the map generator and included a compressed single map instead.

 - Dialog was much more expensive than I expected! This year I really wanted my game to include more AAA-style "tips and tutorials", where you learn as you begin the game how to attack, reload, move around, have some dialog from the character, etc. I think I succeeded and I like how the game starts out, but, I cut many "quips" and pared the dialog down as much as I could... Unlike code or sprites, a 50-character paragraph of text costs just about 50 bytes in the final ZIP.

 - Sound and music was not a challenge this year thanks to the excellent [zzfx](https://github.com/KilledByAPixel/ZzFX) and [zzfxm](https://github.com/keithclark/ZzFXM) projects - when used together they are even better, since you aren't paying "double" for the low-level audio from two different sound engines. The biggest issue I had for music was that after I finished messing with my game music, it was WAY too big to fit into the bytes I had left - I ended up cutting down the number of unique patterns and simplifying the song a bit to fit it in.

 - This year I went back to classic JS instead of TypeScript. Last year I used TS and that was fun and interesting, but overall I prefer classic JS over TS for this competition - I think for this kind of jam, both initial coding and later refactoring are faster with JS, and the "safety" of TS and the very nice completion of built-in APIs doesn't make up for it. (Also, in the year since the last jam, I have become much more sour on TypeScript even in corporate and OSS settings - I'll save my reasons for that for a different writeup, but long and short, I think JS is superior to TS.)

### Plans for future games

There are some things I was hoping to include this year that I didn't get to, the big ones being:

 - Web monetization! I just did not have the space to get it in and wasn't willing to cut anything from the game to make it fit. Next year I am going to put it in first, so I _know_ it will fit.

 - Upgrades. In my initial imagining of this game, there would be upgradable "perks" - the reload-dash for example would be something your purchase, along with bigger clip capacity for the shotgun, and various other abilities like doing more damage on the first shot of a clip, or healing a little bit after firing the last shot of the clip, etc. None of this fit in the final game, unfortunately.

 - Multiple songs. (Either different exploration and battle music, like a Final Fantasy, or music that would more seamlessly "change" during battle - adding extra percussion and an overlay or something.)

 - Menus! Unfortunately I had to cut the concept of menus altogether so you get an initial title card (just to get that first user interaction) and that's it.

Thinking about this functionality, if I was going to put the above into a game next year, I would definitely need to make some big cuts. What I might possibly try is some/all of the following:

 - A zero-sprite game. (Lots of the js13k folks have made amazing games with just vector/native lines and shapes, and I haven't tried it yet - doing so could save me a lot of code space.)

 - A game that doesn't require any real collision detection. "Geometry math" code has taken a decent chunk of my game in the 3 years I've been participating, and if I come up with an idea that doesn't require any of it (or if it could be much simplified), that would give me a lot of extra space to implement features.

So, I don't know what I'll build next year, but maybe it _won't_ be another top-down 2D game!

Thanks for playing and reading, and see you in 2021.

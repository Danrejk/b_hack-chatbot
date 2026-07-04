# CrisisBox Scenario Templates

This document contains scenario templates for crisis-specific chatbox flows. These templates are based on the following structure:

- Scenario name
- Trigger phrases
- Bot agent behavior
- Audio/text guidance
- Encouraging beginning words
- Emergency call option
- Step-by-step safety instructions
- Map or route instruction
- User reactions
- Loop behavior

---

# Scenario: Lost in the City with Internet

## When users say:

```text
"Lost"
"Find my way"
"Stuck"
"Where I am"
"How do I get to"
"I can't find"
"Missed my stop"
"Stranded"
"Guide"
"Which way"
```

## Bot:

→ **location agent**: locate where the user is, understand where the user wants to go, and find the best possible route.

## Audio guidance / text guidance

### Encouraging beginning words:

```text
Stay calm. Help may be nearby. Let’s focus on the next safe step.
```

## Call for police:

```text
Would you like to call for police?
Here is the local number of Police: __.
(automatic call if clicked)
```

## Map instruction:

```text
1. GPS activated.
2. Map generated.
3. Route designed.
4. Guidance with visual markings.
```

## User reactions:

```text
Positive response:
→ continue

Negative response:
→ recalculate
```

## Bot:

Loop until the user finds the way.

---

# Scenario: Flood / Storm

## When users say:

```text
"Flood"
"Storm"
"Heavy rain"
"Water is rising"
"Street is flooded"
"I am trapped by water"
"Power is out"
"Strong wind"
"Tree fell"
"I can't leave the building"
"Water is entering"
"Evacuate"
```

## Bot:

→ **weather / safety agent**: understand the user’s location, whether they are indoors or outdoors, whether water is rising, whether electricity is nearby, and whether evacuation is safe.

## Audio guidance / text guidance

### Encouraging beginning words:

```text
Stay calm. Move away from immediate danger if it is safe. Let’s focus on the next safe step.
```

## Immediate safety questions:

```text
1. Are you indoors, outdoors, or in a vehicle?
2. Is water entering your building or room?
3. Are you on a low floor or basement?
4. Is electricity or wet wiring nearby?
5. Can you safely move to higher ground?
6. Do you need emergency help now?
```

## Emergency call:

```text
Would you like to call emergency services?
Here is the local emergency number: __.
(automatic call if clicked)
```

## Safety instruction:

```text
1. Move to higher ground or a higher floor if safe.
2. Stay away from floodwater.
3. Do not walk, swim, or drive through moving water.
4. Avoid touching electrical devices near water.
5. Keep your phone battery for emergency communication.
6. If evacuation is ordered and the route is safe, follow official instructions.
```

## Map / route instruction, if internet is available:

```text
1. GPS activated.
2. Flood-affected area checked.
3. Safer route generated.
4. Evacuation point or shelter displayed.
5. Guidance with visual markings.
```

## User reactions:

```text
Positive response:
"I can move upstairs"
"I found a safer place"
"I can follow the route"
→ continue guidance

Negative response:
"Water is rising"
"I cannot leave"
"I am trapped"
"The route is blocked"
→ recalculate / switch to emergency waiting guidance
```

## Bot:

Loop until the user reaches a safer place or contacts emergency services.

---

# Scenario: Fire

## When users say:

```text
"Fire"
"Smoke"
"Burning"
"I smell gas"
"Fire alarm"
"I can't breathe"
"Smoke in the hallway"
"Building is on fire"
"Evacuate"
"Exit blocked"
"I am trapped"
```

## Bot:

→ **fire safety agent**: understand whether the user is inside or outside, whether there is smoke, whether exits are blocked, whether the user can evacuate safely, and whether emergency services are needed.

## Audio guidance / text guidance

### Encouraging beginning words:

```text
Stay calm. Fire and smoke can spread quickly. Let’s focus on getting you away from danger safely.
```

## Immediate safety questions:

```text
1. Are you inside the building?
2. Do you see fire or smoke?
3. Is your exit route clear?
4. Are you having trouble breathing?
5. Is anyone injured or trapped?
6. Can you call emergency services?
```

## Emergency call:

```text
Would you like to call the fire department?
Here is the local emergency number: __.
(automatic call if clicked)
```

## Safety instruction:

```text
1. Leave the building immediately if the exit is clear and safe.
2. Stay low if there is smoke.
3. Do not use elevators.
4. Close doors behind you if possible to slow smoke spread.
5. Do not re-enter the building.
6. If trapped, stay near a window, block smoke with cloth if possible, and signal for help.
```

## Map / route instruction, if internet / indoor map is available:

```text
1. GPS or building location activated.
2. Nearby exits identified.
3. Safer evacuation route generated.
4. Fire hazard area avoided.
5. Guidance with visual markings.
```

## User reactions:

```text
Positive response:
"I am outside"
"I found the exit"
"I can breathe"
→ continue with safe waiting / emergency contact guidance

Negative response:
"Exit is blocked"
"Smoke is coming in"
"I cannot breathe"
"I am trapped"
→ switch to trapped-in-fire guidance and emergency call priority
```

## Bot:

Loop until the user is outside, away from smoke, or connected to emergency services.

---

# Scenario: Lost in the Wild

## When users say:

```text
"Lost in the wild"
"Lost in the forest"
"Lost in the mountain"
"No signal"
"I can't find the trail"
"I left the path"
"It is getting dark"
"My battery is low"
"I don't know where I am"
"I am stranded"
"Need rescue"
"Which way should I go"
```

## Bot:

→ **offline wilderness safety agent**: understand whether the user is injured, whether it is getting dark, whether they have signal, battery level, cold risk, water availability, and last known location.

## Audio guidance / text guidance

### Encouraging beginning words:

```text
Stay calm. Stop for a moment. The safest first step is to avoid making the situation worse.
```

## Immediate safety questions:

```text
1. Are you injured?
2. Is it getting dark?
3. What is your battery level?
4. Are you getting cold?
5. Do you have mobile signal?
6. Do you know your last known location?
```

## Emergency call:

```text
Would you like to call emergency services?
Here is the local emergency number: __.
(automatic call if clicked)
```

## Safety instruction:

```text
1. Stop walking randomly.
2. Stay near a visible or open area if possible.
3. Do not follow unknown paths in the dark.
4. Save battery immediately.
5. Mark your location with visible items.
6. Prepare an emergency message with your last known location.
```

## Map / route instruction, if internet is available:

```text
1. GPS activated.
2. Current position estimated.
3. Nearby trail or safe point checked.
4. Route designed only if it is clearly safe.
5. Guidance with visual markings.
```

## Offline instruction, if no internet:

```text
1. Stay where you are unless the location is unsafe.
2. Use visible signals such as bright clothing, stones, or branches.
3. Check signal only occasionally to save battery.
4. Prepare a short rescue message.
5. Keep warm and dry.
```

## User reactions:

```text
Positive response:
"I found the trail"
"I reached an open area"
"I can call someone"
→ continue guidance

Negative response:
"It is darker"
"I am cold"
"I have no signal"
"I am injured"
→ increase risk level and switch to rescue preparation guidance
```

## Bot:

Loop until the user reaches a safe route, contacts emergency services, or enters rescue waiting mode.

---

# Scenario: War / Nuclear / Air Strike

## When users say:

```text
"War"
"Air strike"
"Bombing"
"Explosion"
"Missile"
"Nuclear"
"Radiation"
"Chemical attack"
"Shelling"
"Sirens"
"Attack warning"
"I hear explosions"
"I need shelter"
"Where is the shelter"
```

## Bot:

→ **civil protection agent**: understand the type of threat, whether the user is indoors or outdoors, whether there is a shelter nearby, whether there is smoke, fire, blast damage, radiation warning, or official evacuation order.

## Audio guidance / text guidance

### Encouraging beginning words:

```text
Stay calm. Move away from immediate danger if it is safe. Follow official alerts and focus on shelter first.
```

## Immediate safety questions:

```text
1. Are you indoors or outdoors?
2. Do you hear sirens or explosions now?
3. Is there a shelter, basement, or reinforced building nearby?
4. Are there broken windows, fire, smoke, or unstable structures?
5. Have authorities issued a shelter-in-place or evacuation order?
6. Are you injured?
```

## Emergency call:

```text
Would you like to call emergency services?
Here is the local emergency number: __.
(automatic call if clicked)
```

## Air strike / bombing safety instruction:

```text
1. Move to the nearest shelter, basement, or inner room if safe.
2. Stay away from windows, glass, and exterior walls.
3. Lie low or protect your head if explosions are nearby.
4. Do not go outside to watch or record.
5. Keep your phone charged and use it only for essential communication.
6. Follow official alerts and local authority instructions.
```

## Nuclear / radiation warning instruction:

```text
1. Go indoors immediately.
2. Move to the basement or center of the building.
3. Stay away from windows and outer walls.
4. Close doors and windows.
5. Remove outer clothing if contaminated and place it away from people.
6. Wait for official instructions before leaving shelter.
```

## Map / shelter instruction, if internet is available:

```text
1. GPS activated.
2. Nearby shelter locations checked.
3. Safer route generated if movement is safe.
4. Hazard zones avoided.
5. Guidance with visual markings.
```

## Offline instruction, if no internet:

```text
1. Choose the nearest strong indoor shelter.
2. Avoid windows and exposed outdoor areas.
3. Stay low and protect your head.
4. Save battery.
5. Prepare an emergency message with your location and status.
```

## User reactions:

```text
Positive response:
"I reached shelter"
"I am indoors"
"I am away from windows"
→ continue shelter guidance

Negative response:
"I am outside"
"I cannot find shelter"
"I am injured"
"I see smoke or fire"
"The building is damaged"
→ increase risk level and prioritize immediate protection / emergency call
```

## Bot:

Loop until the user reaches shelter, receives official instruction, or contacts emergency services.

---

# Shared Structure for All Scenarios

You can standardize every crisis flow like this:

```text
Scenario name

When users say:
[keywords]

Bot:
→ agent type

Guidance mode:
audio guidance / text guidance

Encouraging beginning words:
[calm opening sentence]

Immediate safety questions:
[short questions]

Emergency call:
Would you like to call emergency services?
Here is the local number: __.
(automatic call if clicked)

Instructions:
[step-by-step actions]

Map / route instruction:
1. GPS activated.
2. Situation area checked.
3. Safer route or shelter generated.
4. Guidance with visual markings.

User reactions:
Positive response → continue
Negative response → recalculate / increase risk level

Bot:
Loop until user reaches safety or contacts help.
```

## Product note

For the product MVP:

- **Lost in the City** and **Flood / Storm** can be online scenarios.
- **Lost in the Wild** is the strongest offline scenario.
- **Fire** can work as both online and offline guidance depending on whether map/building data is available.
- **War / Nuclear / Air Strike** should rely heavily on official local alerts and conservative shelter-first guidance.

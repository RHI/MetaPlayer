#  MetaPlayer Framework Makefile


# > make
# > make all
#   .. alias for "clean complete teardown minify license externals"
# 	.. builds metaplayer.js metaplayer-complete.js , with minified versions

# > make quick
#   .. alias for "clean complete license externals"
#   .. same as "all" without minified versions

# > make verbose
#   .. alias for "clean core services players ui themes license externals"
#   .. creates all possible outputs

# > make core
#   .. creates metaplayer.js and metaplayer.css containing all players, services, and
#      core libraries (but not ui plugins)

# > make players
#   .. create metaplayer-players.js, and players/<name>/metaplayer.<name>.js for each player plugin

# > make services
#   .. create metaplayer-services.js, and services/<name>/metaplayer.<name>.js for each service plugin
# > make ui
#   .. create metaplayer-ui.js, metaplayer-ui.css, and services/<name>/metaplayer.<name>.js for each ui plugin

# > make external
#   .. copies over third party dependencies into the build/output folder

# > make minify
#   .. creates minified copies of all JS in the build.  Call before 'external' to avoid third party errors.

# > make compact
#   .. removes non-minified sources

# > make license
#   .. tags all JS in the build folder with a version and license. Call before 'external' to avoid mis-tags.
#   .. Version number is a combination src/VERSION and the current date.

# > make clean
#   .. removes all build output


CLOSURE = java -jar  ./external/closure/closure-compiler-20111114.jar
CLOSURE_FLAGS= 

LICENSE=LICENSE
VERSION=0.1.0

BUILD_DIR=build


CORE_JS=$(BUILD_DIR)/metaplayer.js
CORE_CSS=$(BUILD_DIR)/metaplayer.css

ALL_JS=$(BUILD_DIR)/metaplayer-complete.js

PLAYERS_JS=$(BUILD_DIR)/metaplayer-players.js
ALL_PLAYERS=player.html5 player.flowplayer player.youtube player.ovp player.jwplayer player.brightcove

UI_JS=$(BUILD_DIR)/metaplayer-ui.js
UI_CSS=$(BUILD_DIR)/metaplayer-ui.css
ALL_UI=ui.controls ui.overlay ui.transcript ui.captions ui.searchbox ui.videojs ui.endcap ui.social ui.embed ui.framefeed ui.headlines ui.carousel

SERVICES_JS=$(BUILD_DIR)/metaplayer-services.js
ALL_SERVICES=service.mrss service.ramp

ALL_THEMES=theme.mp2

ALL_EXTERNALS=external/jquery external/popcorn

DATE = $(shell date +'%Y%m%d')
VERSION = $(shell cat ./src/VERSION).$(DATE)
LICENSE=LICENSE

compile=$(CLOSURE) $(CLOSURE_FLAGS) --js=$1 >  $2
license=cat $(LICENSE) $1 | sed 's/{{VERSION}}/$(VERSION)/' > $1.tmp; mv $1.tmp $1

all: clean complete teardown minify license externals
	@@echo "Build complete. "

quick: clean complete license externals
	@@echo "Build complete. "

verbose: clean core services players ui themes license externals
	@@echo "Build complete. "


.PHONY : clean license ui complete externals

core: $(BUILD_DIR) $(CORE_CSS) $(CORE_JS) services
	@@echo $@
	@for f in `find $(BUILD_DIR)/services -type f -name "*js" -mindepth 1`; do \
		cat $$f >> $(CORE_JS); \
	done

services: $(ALL_SERVICES)
	@@echo $(SERVICES_JS)
	@for f in `find $(BUILD_DIR)/services -type f -name "*js" -mindepth 1`; do \
		cat $$f >> $(SERVICES_JS); \
	done

players: $(ALL_PLAYERS)
	@@echo $(PLAYERS_JS)
	@for f in `find $(BUILD_DIR)/players -type f -name "*js" -mindepth 1`; do \
		cat $$f >> $(PLAYERS_JS); \
	done

ui: $(ALL_UI)
	@@echo $(UI_JS)
	@for f in `find $(BUILD_DIR)/ui -type f -name "*js" -mindepth 1`; do \
		cat $$f >> $(UI_JS); \
	done
	@@echo $(UI_CSS)
	@for f in `find $(BUILD_DIR)/ui -type f -name "*css" -mindepth 1`; do \
		cat $$f >> $(UI_CSS); \
	done

themes : $(ALL_THEMES)

# all js (core, ui, players, services) in one file
complete : $(CORE_JS) $(ALL_PLAYERS) $(ALL_SERVICES) $(ALL_UI) $(ALL_THEMES)
	@@echo $(ALL_JS);
	@cat $(CORE_JS) >> $(ALL_JS);
	@for f in `find $(BUILD_DIR) -type f -name "*js" -mindepth 2`; do \
		cat $$f >> $(ALL_JS); \
	done

# drops required dependencies into the build output
externals :
	@mkdir -p build/external/;
	@for f in $(ALL_EXTERNALS); do \
		echo $$f; \
		cp -r $$f build/external/ ;\
	done;

# cleans the intermediate individual plugin files not needed for a non-verbose build
teardown : $(BUILD_DIR)
	@for f in build/players build/services build/ui; do \
		rm -rf $$f; \
	done

# remove non-minified sources
compact :
	@for f in `find $(BUILD_DIR) -type f -name "*js" |grep -v min\.js |grep -v external/ `; do \
		rm -f $$f; \
	done

license:
	@@echo $@
	@for f in `find $(BUILD_DIR) -type f -name "*js"`; do \
		cat $(LICENSE) $$f | sed 's/{{VERSION}}/$(VERSION)/' > $$f.tmp; \
		mv $$f.tmp $$f ;\
	done

minify:
	@@echo $@
	@for f in `find $(BUILD_DIR) -type f -name "*js" |grep -v min\.js |grep -v external/ `; do \
		TARGET=`echo $$f | sed 's/js$$/min.js/'`; \
		echo ... $$TARGET; \
		$(CLOSURE) $(CLOSURE_FLAGS) --js=$$f > $$TARGET ;\
	done

$(CORE_CSS): $(BUILD_DIR)
	@@echo $@
	@cat src/core/*/*.css > $@

$(CORE_JS): $(BUILD_DIR)
	@@echo $@
	@cat src/core/*.js > $(CORE_JS)
	@cat src/core/*/*.js >> $(CORE_JS)

service.%: $(BUILD_DIR)
	@echo $@ 
	@mkdir -p build/services/$*;
	@cat src/services/$*/*js >> build/services/$*/metaplayer.$*.js

player.%: $(BUILD_DIR)
	@echo $@ 
	@mkdir -p build/players/$*;
	@cat src/players/$*/*js >> build/players/$*/metaplayer.$*.js

ui.%: $(BUILD_DIR)
	@echo $@
	@mkdir -p build/ui/$*;
	@cat src/ui/$*/*js >> build/ui/$*/metaplayer.$*.js
	@cat src/ui/$*/*css >> build/ui/$*/metaplayer.$*.css
	@if test -d src/ui/$*/templates; then \
		cp src/ui/$*/templates/*\.tmpl\.* $(BUILD_DIR)/templates; \
		fi

theme.%: $(CORE_CSS) $(ALL_UI)
	@echo $(BUILD_DIR)/$*
	@mkdir $(BUILD_DIR)/$*
	@cat $(CORE_CSS) > $(BUILD_DIR)/$*/theme.$*.css
	@cat $(BUILD_DIR)/ui/*/*css >> $(BUILD_DIR)/$*/theme.$*.css 2>/dev/null
	@cat src/themes/$*/*css >> $(BUILD_DIR)/$*/theme.$*.css 2>/dev/null
	@cp -r src/themes/$*/assets $(BUILD_DIR)/$*/ 2>/dev/null

$(BUILD_DIR):
	@echo $@/
	@mkdir  $@
	@mkdir  $@/templates

clean: 
	@echo "Cleaning up previous builds..."
	@rm -rf $(BUILD_DIR);

